import { useContext, useEffect, useState } from "react";
import TileLayer from "ol/layer/Tile";
import AppContext from "../../context/AppContext/AppContext";
import TileWMS from "ol/source/TileWMS.js";

const WMS_URL = "https://sm.cryo-scope.eu/wms";
const LAYER_NAME = "gui:isobands:XTRAFF_SWI1_ENSMEAN";
const ORIGIN_TIME = "20250101T000000";

// "2026-09-02T00:00:00Z" -> "20260902T000000"
const toSmartmetTime = (iso: string) =>
  iso.replace(/[-:]/g, "").replace(/\.\d+/, "").replace("Z", "");

// "20260831T000000" -> "31.8.2026"
const smartmetToDisplay = (t: string) => {
  const m = t.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) return t;
  const [, y, mo, d] = m;
  return new Date(Date.UTC(+y, +mo - 1, +d)).toLocaleDateString("fi-FI", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });
};

// Ask the WMS server what times it actually has, return the newest as SmartMet time.
async function getLatestTime(): Promise<string | null> {
  const url = `${WMS_URL}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities`;
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, "text/xml");

  const layerEl = [...xml.querySelectorAll("Layer > Name")].find(
    (n) => n.textContent?.trim() === LAYER_NAME
  )?.parentElement;
  if (!layerEl) return null;

  const timeDim = [...layerEl.querySelectorAll("Dimension")].find(
    (d) => d.getAttribute("name")?.toLowerCase() === "time"
  );
  if (!timeDim?.textContent) return null;

  const raw = timeDim.textContent.trim();

  // Two possible formats:
  //  1) comma-separated instants: "2026-08-19T00:00:00Z,2026-09-01T00:00:00Z,..."
  //  2) interval: "2026-08-19T00:00:00Z/2026-09-02T00:00:00Z/P1D"
  let times: string[];
  if (raw.includes("/")) {
    const parts = raw.split("/").map((p) => p.trim());
    times = [parts[1] ?? parts[0]];
  } else {
    times = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (!times.length) return null;

  const latest = times.reduce((a, b) =>
    new Date(a).getTime() >= new Date(b).getTime() ? a : b
  );
  return toSmartmetTime(latest);
}

const WMSLayerComponent = () => {
  const appContext = useContext(AppContext);
  if (!appContext) throw new Error("Context is needed");
  const { map, layers } = appContext;

  const [dataTime, setDataTime] = useState<string | null>(null);

  useEffect(() => {
    if (!map || !layers) return;

    let cancelled = false;
    let layer: TileLayer<TileWMS> | null = null;

    (async () => {
      const time = await getLatestTime();
      if (cancelled || !time) return;

      const source = new TileWMS({
        url: WMS_URL,
        params: {
          LAYERS: LAYER_NAME,
          FORMAT: "image/png",
          TIME: time,
          ORIGIN_TIME,
        },
      });
      layer = new TileLayer({ zIndex: 1000, source, opacity: 0.8 });
      layers.getLayers().push(layer);
      setDataTime(time);
    })();

    return () => {
      cancelled = true;
      if (layer) layers.getLayers().remove(layer);
      setDataTime(null);
    };
  }, [map, layers]);

  if (!dataTime) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 860,
        right: 10,
        zIndex: 1001,
        background: "rgba(255,255,255,0.85)",
        padding: "4px 8px",
        borderRadius: 4,
        font: "13px sans-serif",
        pointerEvents: "none",
      }}
    >
      {smartmetToDisplay(dataTime)}
    </div>
  );
};

export default WMSLayerComponent;