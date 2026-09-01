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

    // Greyscale TWI: light = dry (low TWI), dark = wet (high TWI).
    // band 1 is normalised 0..1 by min/max below; (1 - band) inverts it,
    // so dry → light (255), wet → dark. The +30 floor keeps wet from going
    // fully black, so multiply darkens the SWI colour instead of erasing it.
    const createStyleForValue = (_value: number): Style => {
      return {
        color: [
          'color',
          //['*', 255, ['-', 1, ['band', 1]]], // red
          //['*', 255, ['-', 1, ['band', 1]]], // green
          //['*', 255, ['-', 1, ['band', 1]]], // blue
          ['+', 30, ['*', 225, ['clamp', ['-', 1, ['band', 1]], 0, 1]]], // red
          ['+', 30, ['*', 225, ['clamp', ['-', 1, ['band', 1]], 0, 1]]], // green
          ['+', 30, ['*', 225, ['clamp', ['-', 1, ['band', 1]], 0, 1]]], // blue
          ['band', 2],                        // alpha
        ],
      }
    }

    const source = new GeoTIFFSource({
      sources: [
        {
          url: "https://copernicus.data.lit.fmi.fi/dtm/twi/Europe-twi.tif",
          // Data stats: mean -4.6, stddev 1.9, min -11.1, max 10.5.
          // Wide/low-contrast window (whole range included):
          //min: -10,
          //max: 10,
          // Tighter/high-contrast window (mean ± ~1.5σ), for visible local
          // differences — swap the two lines above for these:
          min: -7.5,
          max: -1.5,
        },
      ],
    });
    const layer = new TileLayer({
      zIndex: 1100,
      className: "twi-blend",
      source: source,
      opacity: 0.6,
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