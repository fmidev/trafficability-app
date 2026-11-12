import { FC, useContext, useEffect } from "react";
import TileLayer from "ol/layer/Tile";
import { OSM, XYZ } from "ol/source";
import { transformExtent } from "ol/proj";
import AppContext from "../../context/AppContext/AppContext";

export type Basemap = "maastokartta" | "osm" | "satellite";

// NLS Finland (Maanmittauslaitos) open WMTS, REST tile template in Web Mercator.
const MML_API_KEY = "45deef08-fd2f-42ae-9953-5550fff43b17";
const MML_URL =
  `https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts/1.0.0/maastokartta/default/WGS84_Pseudo-Mercator/{z}/{y}/{x}.png?api-key=${MML_API_KEY}`;
const MML_ATTRIBUTION =
  '© <a href="https://www.maanmittauslaitos.fi/" target="_blank">Maanmittauslaitos</a> (CC BY 4.0)';

// Maastokartta only covers Finland; limit its tiles to this box (lon/lat) so
// OSM shows through outside it, e.g. in Norway and Sweden.
const FINLAND_EXTENT = transformExtent([19.0, 59.3, 31.6, 70.1], "EPSG:4326", "EPSG:3857");

// Sentinel-2 cloudless mosaic by EOX.
const S2_URL =
  "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg";
const S2_ATTRIBUTION =
  '<a href="https://s2maps.eu" target="_blank">Sentinel-2 cloudless</a> by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2020)';

interface BaseLayerProps {
  basemap: Basemap;
}

const BaseLayer: FC<BaseLayerProps> = ({ basemap }) => {
  const appContext = useContext(AppContext);
  if (!appContext) throw new Error("Context is needed");
  const { map, layers } = appContext;

  useEffect(() => {
    if (!map || !layers) return;

    const created: TileLayer[] = [];

    if (basemap === "satellite") {
      created.push(new TileLayer({
        zIndex: 100,
        preload: 1,
        source: new XYZ({ url: S2_URL, attributions: S2_ATTRIBUTION, maxZoom: 17, crossOrigin: "anonymous" }),
      }));
    } else {
      // OSM is always underneath: it is the whole basemap in "osm" mode and
      // the fallback outside Finland in "maastokartta" mode.
      created.push(new TileLayer({ zIndex: 99, preload: 1, source: new OSM() }));
      if (basemap === "maastokartta") {
        created.push(new TileLayer({
          zIndex: 100,
          preload: 1,
          extent: FINLAND_EXTENT,
          source: new XYZ({ url: MML_URL, attributions: MML_ATTRIBUTION, maxZoom: 19, crossOrigin: "anonymous" }),
        }));
      }
    }

    created.forEach((l) => layers.getLayers().push(l));

    return () => {
      created.forEach((l) => layers.getLayers().remove(l));
    };
  }, [map, layers, basemap]);

  return null;
};

export default BaseLayer;