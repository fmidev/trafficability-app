import { useContext, useEffect } from "react";
import GeoTIFFSource from "ol/source/GeoTIFF";
import TileLayer from "ol/layer/WebGLTile";
import AppContext from "../../context/AppContext/AppContext";

const CloudOptimizedGeoTIFFLayerComponent = () => {
  const appContext = useContext(AppContext);

  if (!appContext) {
    throw new Error("Context is needed");
  }

  const { map, layers } = appContext;

  useEffect(() => {
    if (!map || !layers) return;
    const source = new GeoTIFFSource({
      sources: [
        {
          // url: "https://pta.data.lit.fmi.fi/geo/harvestability/KKL_SMK_Suomi_2021_06_01-UTM35.tif",
          url: "https://copernicus.data.lit.fmi.fi/dtm/twi/Europe-twi.tif",          
          // url: "https://copernicus.data.lit.fmi.fi/dtm/twi/Finland-twi.tif",
        },
      ],
      // interpolate: false,
      // convertToRGB: true,
      // normalize: false,
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

export default CloudOptimizedGeoTIFFLayerComponent;
