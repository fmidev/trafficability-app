import { useContext, useEffect } from "react";
import axios from "axios";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import {
  optionsFromCapabilities,
  Options as WMTSOptions,
} from "ol/source/WMTS.js";
import AppContext from "./context/AppContext/AppContext";
import AppContainer from "./AppContainer/AppContainer";

function App() {
  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error("Context is needed");
  }

  const { updateOptions } = appContext;

  useEffect(() => {
    const parser = new WMTSCapabilities();
    axios
      .get(
        "https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts/1.0.0/WMTSCapabilities.xml?api-key=45deef08-fd2f-42ae-9953-5550fff43b17"
      )
      .then((response) => {
        const result = parser.read(response.data);
        const layers = result.Contents.Layer;
        const options = layers
          .map((layer: { Identifier: string }) => {
            const matrixSet = "WGS84_Pseudo-Mercator";
            const layerOptions = optionsFromCapabilities(result, {
              layer: layer.Identifier,
              matrixSet,
            });

            if (!layerOptions || !layerOptions.urls) return null;

            return layerOptions;
          })
          .filter((option: WMTSOptions | null) => option !== null);

        updateOptions(options as WMTSOptions[]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AppContainer />;
}

export default App;
