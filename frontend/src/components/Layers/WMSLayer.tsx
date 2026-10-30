import { useContext, useEffect, useRef } from "react";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS.js";
import AppContext from "../../context/AppContext/AppContext";
import { WMS_URL, toSmartmetTime } from "../../utils/wmsCapabilities";

interface WMSLayerProps {
  layerName: string;
  opacity: number;
  // ISO valid time to show; the layer is hidden while this is null.
  time: string | null;
  // ISO forecast run; omitted from the request when null (server default).
  originTime: string | null;
  zIndex?: number;
}

// Generic SmartMet WMS layer. The layer is built once per layerName; time,
// origintime and opacity changes only update the existing source/layer, so
// stepping or playing through the forecast does not rebuild anything.
const WMSLayerComponent = ({ layerName, opacity, time, originTime, zIndex = 1000 }: WMSLayerProps) => {
  const appContext = useContext(AppContext);
  if (!appContext) throw new Error("Context is needed");
  const { map, layers } = appContext;

  const layerRef = useRef<TileLayer<TileWMS> | null>(null);

  // Latest values for the create-effect, so it doesn't depend on them.
  const latest = useRef({ opacity, time, originTime });
  latest.current = { opacity, time, originTime };

  useEffect(() => {
    if (!map || !layers) return;

    const { opacity: op, time: t, originTime: ot } = latest.current;
    const params: Record<string, string> = {
      LAYERS: layerName,
      FORMAT: "image/png",
      TRANSPARENT: "true",
    };
    if (t) params.TIME = toSmartmetTime(t);
    if (ot) params.origintime = toSmartmetTime(ot);

    const layer = new TileLayer({
      zIndex,
      opacity: op,
      visible: !!t,
      source: new TileWMS({ url: WMS_URL, params }),
    });
    layerRef.current = layer;
    layers.getLayers().push(layer);

    return () => {
      layers.getLayers().remove(layer);
      layerRef.current = null;
    };
  }, [map, layers, layerName, zIndex]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.setVisible(!!time);
    if (!time) return;
    const update: Record<string, string> = { TIME: toSmartmetTime(time) };
    if (originTime) update.origintime = toSmartmetTime(originTime);
    layer.getSource()?.updateParams(update);
  }, [time, originTime]);

  useEffect(() => {
    layerRef.current?.setOpacity(opacity);
  }, [opacity]);

  return null;
};

export default WMSLayerComponent;