import { useContext, useEffect, useRef } from "react";
import GeoTIFFSource from "ol/source/GeoTIFF";
import TileLayer from "ol/layer/WebGLTile";
import type { TileSourceEvent } from "ol/source/Tile";
import type DataTile from "ol/DataTile";
import type { ExpressionValue } from "ol/expr/expression";
import AppContext from "../../context/AppContext/AppContext";

// Slope as a (Cloud Optimized) GeoTIFF reachable over HTTPS.
// Testing: one 2 m map sheet (X4, northern Lapland).
export const SLOPE_COG_URL = "https://pta.data.lit.fmi.fi/dem/etrs-tm35fin-n2000/slope/MML-DTM-2020-2m-X4-slope.tif";
// Whole of Finland, once built:
// export const SLOPE_COG_URL = "https://pta.data.lit.fmi.fi/dem/etrs-tm35fin-n2000/slope/MML-DTM-2020-10m-slope-cog.tif";

// Raster values are slope angles in degrees.
const DEG2RAD = Math.PI / 180;

// Stretch: these percentiles of slope map to black and white (try 5/95 or 10/90).
// AUTO: measured from the first tiles that load (logged to the console);
// set to false to use the fixed values below instead.
const SLOPE_AUTO_STRETCH = true;
const STRETCH_LOW_PCT = 10;
const STRETCH_HIGH_PCT = 90;
// Fixed fallback stretch in degrees, used until (or instead of) the automatic one.
const SLOPE_LO_DEG = 0.5;
const SLOPE_HI_DEG = 15;
// Pixels sampled before the automatic stretch is fixed.
const AUTO_SAMPLE_TARGET = 200_000;

// q(θ) = 1 - cos(θ), written as 2·sin²(θ/2) so it stays exact for small slopes
// (1 - cos loses all precision near 0° on mediump GPUs). q rises with steepness.
// grey = 255 · clamp((q - qLo) / (qHi - qLo), 0, 1)
//   flat -> black (more snow), steep -> white (less snow), median ≈ mid-grey (neutral).
const q = (deg: number) => 2 * Math.sin((deg * DEG2RAD) / 2) ** 2;

// sin² as a product, not pow(): GLSL pow() is undefined for negative input (NoData).
const halfSin: ExpressionValue = ["sin", ["*", ["band", 1], DEG2RAD / 2]];
const qExpr: ExpressionValue = ["*", 2, ["*", halfSin, halfSin]];
// qHi > qLo is guaranteed in JS before the variables are set.
const greyExpr: ExpressionValue = [
  "*",
  255,
  ["clamp", ["/", ["-", qExpr, ["var", "qLo"]], ["-", ["var", "qHi"], ["var", "qLo"]]], 0, 1],
];

const percentile = (sorted: Float64Array, p: number) =>
  sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))))];

interface SlopeLayerProps {
  opacity: number;
  // true: soft-light blend onto the layers below (SWE); false: plain greyscale layer
  blend: boolean;
}

const SlopeLayerComponent = ({ opacity, blend }: SlopeLayerProps) => {
  const appContext = useContext(AppContext);
  if (!appContext) throw new Error("Context is needed");
  const { map, layers } = appContext;

  const layerRef = useRef<TileLayer | null>(null);
  const opacityRef = useRef(opacity);
  opacityRef.current = opacity;

  useEffect(() => {
    if (!map || !layers) return;
    let cancelled = false;

    const source = new GeoTIFFSource({
      // Raw slope values into the style expression, not 0..1.
      normalize: false,
      sources: [{ url: SLOPE_COG_URL }],
    });

    const layer = new TileLayer({
      zIndex: 1100,
      // Own canvas per class name; the CSS in index.css sets the blend mode.
      className: blend ? "slope-blend" : "slope-plain",
      source,
      opacity: opacityRef.current,
      // Hidden until the style is set, once the band count is known.
      visible: false,
    });
    layerRef.current = layer;
    layers.getLayers().push(layer);

    // The source only adds an alpha band (band 2) when the file has NoData;
    // referencing a missing band breaks the shader, so build the style once ready.
    source
      .getView()
      .then(() => {
        if (cancelled) return;
        const hasAlpha = source.bandCount > 1;
        // With normalize:false the alpha band is 0 or 255.
        const alpha: ExpressionValue = hasAlpha ? ["/", ["band", 2], 255] : 1;
        layer.setStyle({
          variables: { qLo: q(SLOPE_LO_DEG), qHi: q(SLOPE_HI_DEG) },
          color: ["color", greyExpr, greyExpr, greyExpr, alpha],
        });
        layer.setVisible(true);
        console.info(`[slope] ${SLOPE_COG_URL} bands=${source.bandCount} nodataMask=${hasAlpha}`);
      })
      .catch((err) => console.error("[slope] could not open", SLOPE_COG_URL, err));

    // Automatic stretch from the values in the first loaded tiles.
    let samples: number[] = [];
    let calibrated = !SLOPE_AUTO_STRETCH;
    const onTileLoad = (evt: TileSourceEvent) => {
      if (calibrated || cancelled) return;
      const data = (evt.tile as DataTile).getData();
      if (!data || !("length" in data)) return;
      const arr = data as ArrayLike<number>;
      const bands = source.bandCount;
      const hasAlpha = bands > 1;
      for (let i = 0; i < arr.length; i += bands) {
        const v = arr[i];
        if (hasAlpha && arr[i + 1] === 0) continue; // NoData
        if (!Number.isFinite(v) || v < 0) continue;
        samples.push(v);
      }
      if (samples.length < AUTO_SAMPLE_TARGET) return;

      calibrated = true;
      const sorted = Float64Array.from(samples).sort();
      samples = [];
      const pLo = percentile(sorted, STRETCH_LOW_PCT);
      const p50 = percentile(sorted, 50);
      const pHi = percentile(sorted, STRETCH_HIGH_PCT);
      console.info(
        `[slope] raw values: min=${sorted[0].toFixed(3)} p${STRETCH_LOW_PCT}=${pLo.toFixed(3)} median=${p50.toFixed(3)} ` +
          `p${STRETCH_HIGH_PCT}=${pHi.toFixed(3)} max=${sorted[sorted.length - 1].toFixed(3)} (n=${sorted.length})`
      );
      if (q(pHi) > q(pLo)) layer.updateStyleVariables({ qLo: q(pLo), qHi: q(pHi) });
      else console.warn("[slope] low and high percentiles are equal; keeping the fixed stretch");
    };
    source.on("tileloadend", onTileLoad);

    return () => {
      cancelled = true;
      source.un("tileloadend", onTileLoad);
      layers.getLayers().remove(layer);
      layerRef.current = null;
    };
  }, [map, layers, blend]);

  useEffect(() => {
    layerRef.current?.setOpacity(opacity);
  }, [opacity]);

  return null;
};

export default SlopeLayerComponent;