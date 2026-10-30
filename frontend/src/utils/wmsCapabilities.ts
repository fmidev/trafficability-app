// Helpers for reading time information from the SmartMet WMS GetCapabilities.
// The capabilities document is fetched once and shared by all layers.

export const WMS_URL = "https://sm.cryo-scope.eu/wms";

export interface LayerTimeInfo {
  // Newest forecast run (ISO, e.g. "2026-10-29T00:00:00Z"), or null if the
  // server does not advertise a reference_time / origintime dimension.
  originTime: string | null;
  // Valid times of that run, ISO, sorted ascending.
  times: string[];
}

let capsPromise: Promise<Document> | null = null;

export function getCapabilities(): Promise<Document> {
  if (!capsPromise) {
    const url = `${WMS_URL}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities`;
    capsPromise = fetch(url, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`GetCapabilities failed: ${res.status}`);
        return res.text();
      })
      .then((text) => new DOMParser().parseFromString(text, "text/xml"))
      .catch((err) => {
        capsPromise = null; // allow a retry later
        throw err;
      });
  }
  return capsPromise;
}

// "2026-10-30T00:00:00Z" -> "20261030T000000" (SmartMet compact time)
export const toSmartmetTime = (iso: string) =>
  iso.replace(/[-:]/g, "").replace(/\.\d+/, "").replace("Z", "");

const normaliseIso = (t: string): string | null => {
  const ms = Date.parse(t);
  if (isNaN(ms)) return null;
  return new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");
};

// ISO 8601 period such as P1D, PT1H, PT6H, P1DT12H -> milliseconds
const periodToMs = (p?: string): number | null => {
  if (!p) return null;
  const m = p.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!m) return null;
  const [, d, h, min, s] = m.map((v) => (v ? Number(v) : 0));
  const ms = (((d * 24 + h) * 60 + min) * 60 + s) * 1000;
  return ms > 0 ? ms : null;
};

// Expands a WMS dimension value into a list of ISO instants. Handles both
// comma separated instants and start/end/period intervals (and mixtures).
const expandDimension = (raw: string): string[] => {
  const out: string[] = [];
  for (const part of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
    if (part.includes("/")) {
      const [start, end, period] = part.split("/").map((s) => s.trim());
      const s = Date.parse(start);
      const e = Date.parse(end);
      const step = periodToMs(period);
      if (isNaN(s) || isNaN(e) || !step) {
        const single = normaliseIso(end || start);
        if (single) out.push(single);
        continue;
      }
      for (let t = s; t <= e && out.length < 5000; t += step) {
        out.push(new Date(t).toISOString().replace(/\.\d+Z$/, "Z"));
      }
    } else {
      const single = normaliseIso(part);
      if (single) out.push(single);
    }
  }
  return [...new Set(out)].sort();
};

const findLayer = (xml: Document, layerName: string): Element | null => {
  const nameEl = [...xml.getElementsByTagName("Name")].find(
    (n) => n.parentElement?.tagName === "Layer" && n.textContent?.trim() === layerName
  );
  return nameEl?.parentElement ?? null;
};

// Dimensions are inherited from parent layers in WMS, so walk upwards.
const findDimension = (layer: Element, names: string[]): Element | null => {
  let el: Element | null = layer;
  while (el && el.tagName === "Layer") {
    const dim = [...el.children].find(
      (c) => c.tagName === "Dimension" && names.includes((c.getAttribute("name") ?? "").toLowerCase())
    );
    if (dim) return dim;
    el = el.parentElement;
  }
  return null;
};

export async function getLayerTimeInfo(layerName: string): Promise<LayerTimeInfo | null> {
  const xml = await getCapabilities();
  const layer = findLayer(xml, layerName);
  if (!layer) {
    console.warn(`WMS layer ${layerName} not found in capabilities`);
    return null;
  }

  const refDim = findDimension(layer, ["reference_time", "origintime", "origin_time"]);
  const refTimes = refDim?.textContent ? expandDimension(refDim.textContent) : [];
  const originTime = refTimes.length ? refTimes[refTimes.length - 1] : null;

  const timeDim = findDimension(layer, ["time"]);
  let times = timeDim?.textContent ? expandDimension(timeDim.textContent) : [];

  // The time dimension may list times of all runs; keep the ones of the newest run.
  if (originTime) times = times.filter((t) => t >= originTime);

  if (!originTime) {
    console.warn(
      `No reference_time dimension for ${layerName}; requesting without origintime (server default run).`
    );
  }
  return { originTime, times };
}