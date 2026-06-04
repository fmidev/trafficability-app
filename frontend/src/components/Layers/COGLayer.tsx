import { useContext, useEffect } from "react";
import GeoTIFFSource from "ol/source/GeoTIFF";
import TileLayer, { Style } from "ol/layer/WebGLTile";
import AppContext from "../../context/AppContext/AppContext";
import debounce from "lodash/debounce";
import BaseEvent from "ol/events/Event";
import { unByKey } from "ol/Observable";

const COGLayerComponent = () => {
  const appContext = useContext(AppContext);

  if (!appContext) {
    throw new Error("Context is needed");
  }

  const { map, layers } = appContext;

  useEffect(() => {
    if (!map || !layers) return;

    // TODO: this function creates the styling function for the TWI data using the "value" retrieved for the center coordinates
    const createStyleForValue = (value: number) : Style => {
      return {
        color: [
          'color',
          // red: combine the sampled TWI value with the first raster band
          ['*', 255, ['+', value, ['band', 1]]],
          // green: use the first raster band for the TWI visualization
          ['*', 255, ['band', 1]],
          // blue: use the first raster band for the TWI visualization
          ['*', 255, ['band', 1]],
          // alpha
          ['band', 2],
        ],
      }
    }

    const source = new GeoTIFFSource({
      sources: [
        {
          url: "https://copernicus.data.lit.fmi.fi/dtm/twi/Europe-twi.tif",
          // TODO: value range that will be used to normalize values for the style function
          min: -10,
          max: 10,
        },
      ],
    });
    const layer = new TileLayer({
      zIndex: 1000,
      source: source,
      opacity: 1,
      style: createStyleForValue(0),
    });

    // This will trigger a map render, but debouce it so we don't end up re-rendering multiple times over
    const debouncedMapRender = debounce((value: number) => {
      layer.setStyle(createStyleForValue(value))
    }, 150, { trailing: true})

    // This will trigger a request to get data from the backend service, but de-bounced so we don't trigger a huge amount of requests
    const debouncedAPICall = debounce((coords: number[]) => {

      // This would be the API call for coords
      setTimeout(() => {
        const value = Math.random();
        console.log('Got simulated value', value, 'for coords', coords);
        debouncedMapRender(value);
      }, 200);

    }, 150, { trailing: true });

    const eventListenerChangeCenter = (evt: BaseEvent | Event) => {
      debouncedAPICall(evt.target.getCenter());
    }

    const eventKey = map.getView().on('change:center', eventListenerChangeCenter)

    layers.getLayers().push(layer);

    return () => {
      if (layer instanceof TileLayer) {
        layers.getLayers().remove(layer);
      }
      unByKey(eventKey);
    };
  }, [map, layers]);

  return null;
};

export default COGLayerComponent;
