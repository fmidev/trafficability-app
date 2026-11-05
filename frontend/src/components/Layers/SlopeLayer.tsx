import { useContext, useEffect, useRef } from "react";
import GeoTIFFSource from "ol/source/GeoTIFF";
import TileLayer from "ol/layer/WebGLTile";
import type { TileSourceEvent } from "ol/source/Tile";
import type DataTile from "ol/DataTile";
import type { ExpressionValue } from "ol/expr/expression";
import AppContext from "../../context/AppContext/AppContext";

// Slope as a byte COG reachable over HTTPS: 2 m slope for all of Finland,
// with overviews down to a single tile.
export const SLOPE_COG_URL = "https://pta.data.lit.fmi.fi/dem/etrs-tm35fin-n2000/slope/MML-DTM-2020-2m-slope-8b.tif";

const DEG2RAD = Math.PI / 180;

// Byte encoding: slope in radians, 0..1.557 scaled linearly to 0..254; 255 = NoData.
const SLOPE_MAX_RAD = 1.557;
const SLOPE_MAX_BYTE = 254;
const RAD_PER_UNIT = SLOPE_MAX_RAD / SLOPE_MAX_BYTE; // ≈ 0.00613 rad ≈ 0.351° per step
const DEG_PER_UNIT = RAD_PER_UNIT / DEG2RAD;
const SLOPE_NODATA = 255;

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
// Overviews are averaged, which flattens slopes, so only calibrate on
// detailed data (zoom 11 ≈ 31 m/px at 66°N).
const AUTO_STRETCH_MIN_ZOOM = 11;

// q(θ) = 1 - cos(θ), written as 2·sin²(θ/2) so it stays exact for small slopes
// (1 - cos loses all precision near 0° on mediump GPUs). q rises with steepness.
// grey = 255 · clamp((q - qLo) / (qHi - qLo), 0, 1)
//   flat -> black (more snow), steep -> white (less snow), median ≈ mid-grey (neutral).
const q = (deg: number) => 2 * Math.sin((deg * DEG2RAD) / 2) ** 2;

// Byte value -> radians -> θ/2, folded into a single factor.
const halfSin: ExpressionValue = ["sin", ["*", ["band", 1], RAD_PER_UNIT / 2]];
// sin² as a product, not pow().
const qExpr: ExpressionValue = ["*", 2, ["*", halfSin, halfSin]];
// qHi > qLo is guaranteed in JS before the variables are set.
const greyExpr: ExpressionValue = [
  "*",
  255,
  ["clamp", ["/", ["-", qExpr, ["var", "qLo"]], ["-", ["var", "qHi"], ["var", "qLo"]]], 0, 1],
];
// Explicit NoData mask, so 255 stays transparent even if the file lacks a NoData tag.
const isValid: ExpressionValue = ["<", ["band", 1], SLOPE_NODATA - 0.5];

// Percentile in degrees from a histogram of byte values.
const histPercentile = (hist: Float64Array, n: number, p: number) => {
  const target = (p / 100) * (n - 1);
  let cum = 0;
  for (let b = 0; b < hist.length; b++) {
    cum += hist[b];
    if (cum > target) return b * DEG_PER_UNIT;
  }
  return (hist.length - 1) * DEG_PER_UNIT;
};

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
      // Raw byte values into the style expression, not 0..1.
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
        const fileAlpha: ExpressionValue = hasAlpha ? ["/", ["band", 2], 255] : 1;
        const alpha: ExpressionValue = ["case", isValid, fileAlpha, 0];
        layer.setStyle({
          variables: { qLo: q(SLOPE_LO_DEG), qHi: q(SLOPE_HI_DEG) },
          color: ["color", greyExpr, greyExpr, greyExpr, alpha],
        });
        layer.setVisible(true);
        console.info(`[slope] ${SLOPE_COG_URL} bands=${source.bandCount} nodataMask=${hasAlpha}`);
      })
      .catch((err) => console.error("[slope] could not open", SLOPE_COG_URL, err));

    // Automatic stretch from the values in the first detailed tiles.
    // Byte data, so a 255-bin histogram replaces collecting and sorting samples.
    const hist = new Float64Array(SLOPE_NODATA);
    let n = 0;
    let calibrated = !SLOPE_AUTO_STRETCH;
    const onTileLoad = (evt: TileSourceEvent) => {
      if (calibrated || cancelled) return;
      if ((map.getView().getZoom() ?? 0) < AUTO_STRETCH_MIN_ZOOM) return;
      const data = (evt.tile as DataTile).getData();
      if (!data || !("length" in data)) return;
      const arr = data as ArrayLike<number>;
      const bands = source.bandCount;
      const hasAlpha = bands > 1;
      for (let i = 0; i < arr.length; i += bands) {
        if (hasAlpha && arr[i + 1] === 0) continue; // NoData via mask
        const b = Math.round(arr[i]);
        if (!(b >= 0 && b < SLOPE_NODATA)) continue; // NoData value or out of range
        hist[b]++;
        n++;
      }
      if (n < AUTO_SAMPLE_TARGET) return;

      calibrated = true;
      let minB = 0;
      while (minB < hist.length - 1 && hist[minB] === 0) minB++;
      let maxB = hist.length - 1;
      while (maxB > 0 && hist[maxB] === 0) maxB--;
      const pLo = histPercentile(hist, n, STRETCH_LOW_PCT);
      const p50 = histPercentile(hist, n, 50);
      const pHi = histPercentile(hist, n, STRETCH_HIGH_PCT);
      console.info(
        `[slope] degrees: min=${(minB * DEG_PER_UNIT).toFixed(2)} p${STRETCH_LOW_PCT}=${pLo.toFixed(2)} median=${p50.toFixed(2)} ` +
          `p${STRETCH_HIGH_PCT}=${pHi.toFixed(2)} max=${(maxB * DEG_PER_UNIT).toFixed(2)} (n=${n})`
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