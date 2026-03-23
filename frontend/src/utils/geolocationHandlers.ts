import { Map } from "ol";
import { Position } from "../types";
import { ToastId, UseToastOptions } from "@chakra-ui/react";
import { circular } from "ol/geom/Polygon";

export const handleGeolocationSuccess = (
  position: GeolocationPosition,
  map: Map | null,
  updateOriginalPosition: (pos: Position) => void,
  updateAccuracy: (accuracy: number | null) => void,
  setMessageVisible: (visible: boolean) => void
) => {
  setMessageVisible(false);
  const { latitude, longitude, accuracy } = position.coords;
  updateOriginalPosition({ lon: longitude, lat: latitude, accurracy: accuracy });
  updateAccuracy(accuracy);

  // pad the fit geometry to have a bit of space around it
  const paddedGeometry = circular([longitude, latitude], accuracy * 1.1).transform("EPSG:4326", "EPSG:3857");
  // create a minimum circle of 150m to fit the view so as to have a usable map in highly accurate scenarios
  const minimumCircle = circular([longitude, latitude], 150).transform("EPSG:4326", "EPSG:3857");

  const fitGeometry = paddedGeometry.getArea() > minimumCircle.getArea() ? paddedGeometry : minimumCircle;
  if (typeof fitGeometry !== "undefined") {
    map?.getView().fit(fitGeometry);
  }
};

export const handleGeolocationError = (
  error: GeolocationPositionError,
  toast: (options?: UseToastOptions | undefined) => ToastId,
  setMessageVisible: (visible: boolean) => void
) => {
  console.error("Geolocation error:", error);
  if (error.code === 1) {
    setMessageVisible(true);
    toast({
      title: "Virhe",
      description: `Salli pääsy sijaintiisi.`,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  } else {
    console.error("Geolocation error:", error.message);
  }
};

export const getCurrentPosition = (
  map: Map | null,
  updateOriginalPosition: (pos: Position) => void,
  updateAccuracy: (accuracy: number | null) => void,
  setMessageVisible: (visible: boolean) => void,
  toast: (options?: UseToastOptions | undefined) => ToastId
) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => handleGeolocationSuccess(position, map, updateOriginalPosition, updateAccuracy, setMessageVisible),
      (error) => handleGeolocationError(error, toast, setMessageVisible)
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
};
