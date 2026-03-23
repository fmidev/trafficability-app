import { useContext, useEffect, useState, FC } from "react";
import Feature from "ol/Feature";
import { Point, Polygon } from "ol/geom";
import { circular } from "ol/geom/Polygon";
import { Vector as VectorLayer } from "ol/layer";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import Icon from "ol/style/Icon";
import { Style, Stroke, Fill } from "ol/style";
import AppContext from "../../context/AppContext/AppContext";
import { unByKey } from "ol/Observable";

interface MarkerLayerComponentProps {
  setCrosshair: (crosshair: boolean) => void;
  setStrokeColor: (strokeColor: string) => void;
  strokeColor: string;
}

const MarkerLayerComponent: FC<MarkerLayerComponentProps> = ({
  setCrosshair,
  setStrokeColor,
  strokeColor }) => {
  const [markerFeature, setMarkerFeature] = useState<Feature<Point> | null>(
    null
  );
  const appContext = useContext(AppContext);

  if (!appContext) {
    throw new Error("Context is needed");
  }

  const { map, layers, options, initialLocation, userAdjustedLocation , accuracy, updateUserAdjustedLocation, updateAccuracy } = appContext;

  useEffect(() => {
    if (!map || !options || initialLocation.lat === null || initialLocation.lon === null || accuracy === null)
      return;

    const location = userAdjustedLocation.lat === null || userAdjustedLocation.lon === null ? initialLocation : userAdjustedLocation;
    const convertedCoord = fromLonLat([location.lon!, location.lat!]);

    let vectorLayer = map
      .getLayers()
      .getArray()
      .find(
        (layer) => layer instanceof VectorLayer && layer.getZIndex() === 1000
      ) as VectorLayer;

    if (!vectorLayer) {
      vectorLayer = new VectorLayer({
        zIndex: 1000,
        source: new VectorSource(),
      });
      map.addLayer(vectorLayer);
    }

    vectorLayer.getSource()?.clear();

    const initialMarkerFeature = new Feature<Point>({
      geometry: new Point(convertedCoord),
    });

    const markerStyle = new Style({
      image: new Icon({
        src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
        scale: 0.05,
        anchor: [0.5, 1],
      }),
    });

    initialMarkerFeature.setStyle(markerStyle);
    vectorLayer.getSource()?.addFeature(initialMarkerFeature);
    setMarkerFeature(initialMarkerFeature);

    const circleGeometry = circular(
      [location.lon!, location.lat!],
      accuracy ? accuracy : strokeColor === "red" ? 5 : 20,
      64
    );
    const circleFeature = new Feature<Polygon>(circleGeometry);
    circleFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: strokeColor,
          width: 2,
        }),
        fill: new Fill({
          color: "rgba(196, 128, 196, 0.4)",
        }),
      })
    );

    circleFeature.getGeometry()?.transform("EPSG:4326", "EPSG:3857");
    vectorLayer.getSource()?.addFeature(circleFeature);

    return () => {
      if (map) {
        map.removeLayer(vectorLayer);
        vectorLayer.getSource()?.clear();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    map,
    options,
    initialLocation.lat,
    initialLocation.lon,
    userAdjustedLocation.lat,
    userAdjustedLocation.lon,
    layers,
    accuracy,
  ]);

  useEffect(() => {
    if (!map || !markerFeature) return;

    let isDragging = false;
    const handlePointerDrag = () => {
      isDragging = true;
      setCrosshair(true);
      setStrokeColor("red");
    };

    const handleMoveEnd = () => {
      setCrosshair(false);
      if (!isDragging) return;
      if (markerFeature) {
        const center = map.getView().getCenter();
        if (center) {
          const [newLon, newLat] = toLonLat(center);
          updateUserAdjustedLocation({ lat: newLat, lon: newLon });
          updateAccuracy(5)
        }
      }
      isDragging = false;
    };

    const pointerDrag = map.on("pointerdrag", handlePointerDrag);
    const moveEnd = map.on("moveend", handleMoveEnd);

    const changeResolution = map.getView().on("change:resolution", () => {
      isDragging = false;
    });

    return () => {
      unByKey(pointerDrag);
      unByKey(moveEnd);
      unByKey(changeResolution);
    };
  }, [
    map,
    markerFeature,
    updateUserAdjustedLocation,
    updateAccuracy,
    setCrosshair,
    setStrokeColor,
  ]);

  return null;
};

export default MarkerLayerComponent;
