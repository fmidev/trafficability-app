import { FC, useContext, useEffect } from "react";
import TileLayer from "ol/layer/Tile";
import WMTS, { Options as WMTSOptions } from "ol/source/WMTS.js";
import AppContext from "../../context/AppContext/AppContext";
import { OSM } from "ol/source";

interface BaseLayerProps {
  layerName: string;
}

const LayerComponent: FC<BaseLayerProps> = ({ layerName }) => {
  const appContext = useContext(AppContext);

  if (!appContext) {
    throw new Error("Context is needed");
  }

  const { map, layers, options, currentLanguage } = appContext;

  useEffect(() => {
    if (!map || !layers || !options) return;

    const option = options.find(
      (opt: { layer: string }) => opt.layer === layerName
    ) as WMTSOptions;

    option.urls = option?.urls?.map((url: string) =>
      url.includes("api-key=")
        ? url
        : `${url}${
            url.includes("?") ? "&" : "?"
          }api-key=45deef08-fd2f-42ae-9953-5550fff43b17`
    );
    const layer = new TileLayer({
      zIndex: 100,
      source: currentLanguage === 'fi' ? new WMTS(option): new OSM(),
    });

    layers.getLayers().push(layer);

    return () => {
      if (layer instanceof TileLayer) {
        layers.getLayers().remove(layer);
      }
    };
  }, [map, layers, options, layerName, currentLanguage]);

  return null;
};

export default LayerComponent;
