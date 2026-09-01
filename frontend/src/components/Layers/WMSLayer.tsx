import { useContext, useEffect } from "react";
// import GeoTIFFSource from "ol/source/GeoTIFF";
import TileLayer from "ol/layer/Tile";
import AppContext from "../../context/AppContext/AppContext";
import TileWMS from 'ol/source/TileWMS.js';

const WMSLayerComponent = () => {
  const appContext = useContext(AppContext);

  if (!appContext) {
    throw new Error("Context is needed");
  }

  const { map, layers } = appContext;

  useEffect(() => {
    if (!map || !layers) return;

    // const now = new Date();
    // const yyyy = now.getUTCFullYear();
    // const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    // const dd = String(now.getUTCDate()).padStart(2, "0");
    // const time = `${yyyy}${mm}${dd}T000000`;

    const source = new TileWMS({
      url: "https://sm.cryo-scope.eu/wms",
      // url: "https://desm.harvesterseasons.com/wms",
      params: {
        LAYERS: "gui:isobands:XTRAFF_SWI1_ENSMEAN",
        // LAYERS: "harvester:ecens:TSOIL-K",
        FORMAT: "image/png",
        // TIME: "20250806T000000",
        // ORIGIN_TIME: "20250806T000000"
        // TIME: time,
        TIME: "20260824T000000",
        ORIGIN_TIME: "20250101T000000"
      },
    });
    const layer = new TileLayer({
      zIndex: 1000,
      source: source,
      opacity: 0.8,
    });

    layers.getLayers().push(layer);

    return () => {
      if (layer instanceof TileLayer) {
        layers.getLayers().remove(layer);
      }
    };
  }, [map, layers]);

  return null;
};

export default WMSLayerComponent;
