import { Map } from "ol";
import { Position } from "../types";
import { ToastId, UseToastOptions } from "@chakra-ui/react";
import { circular } from "ol/geom/Polygon";
import { GEOLOCATION_COOKIE, setCookie, deleteCookie } from "./cookies";

export const handleGeolocationSuccess = (
  position: GeolocationPosition,
  map: Map | null,
  updateOriginalPosition: (pos: Position) => void,
  updateAccuracy: (accuracy: number | null) => void,
  setMessageVisible: (visible: boolean) => void
) => {
  setMessageVisible(false);
  // Remember that location access works so the map can locate automatically next time
  setCookie(GEOLOCATION_COOKIE, "1");
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
    // Permission denied: forget the earlier acceptance so we stop auto-locating
    deleteCookie(GEOLOCATION_COOKIE);
    setMessageVisible(true);
    toast({
      title: "Virhe",
      description: `Salli pääsy sijaintiisi.`,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  } else {
    // Timeout or position unavailable: show the hint again so the user can tap to retry
    setMessageVisible(true);
    console.error("Geolocation error:", error.message);
  }
};

export const getCurrentPosition = (
  map: Map | null,
  updateOriginalPosition: (pos: Position) => void,
  updateAccuracy: (accuracy: number | null) => void,
  setMessageVisible: (visible: boolean) => void,
  toast: (options?: UseToastOptions | undefined) => ToastId,
  onSuccess?: () => void,
  // Called once the request ends either way (used to hide the "getting location" indicator)
  onFinished?: () => void
) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onFinished?.();
        handleGeolocationSuccess(position, map, updateOriginalPosition, updateAccuracy, setMessageVisible);
        onSuccess?.();
      },
      (error) => {
        onFinished?.();
        handleGeolocationError(error, toast, setMessageVisible);
      },
      // Without a timeout the browser may never answer (the default is to wait
      // forever), which leaves the map sitting at the overview. A fix up to one
      // minute old is fine and makes the reload case faster.
      { timeout: 15000, maximumAge: 60000 }
    );
  } else {
    onFinished?.();
    console.error("Geolocation is not supported by this browser.");
  }
};