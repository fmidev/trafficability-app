import {
  FC,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Box, Text, Spinner, HStack, useToast, useBreakpointValue } from "@chakra-ui/react";
import { Map, View } from "ol";
import { defaults as defaultControls } from "ol/control";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import proj4 from "proj4";
import { register } from "ol/proj/proj4.js";
import AppContext from "../../context/AppContext/AppContext";
import { unByKey } from "ol/Observable";
import { getCurrentPosition } from "../../utils/geolocationHandlers";
import { GEOLOCATION_COOKIE, getCookie } from "../../utils/cookies";
import { loadAdjustedLocation } from "../../utils/savedLocation";
import { circular } from "ol/geom/Polygon";

proj4.defs(
  "EPSG:3857",
  "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs"
);
proj4.defs(
  "EPSG:3067",
  "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs"
);
proj4.defs(
  "EPSG:32635",
  "+proj=utm +zone=35 +datum=WGS84 +units=m +no_defs +type=crs"
);

register(proj4);

interface MapComponentProps {
  children: ReactNode;
  center: [number, number];
  setStrokeColorInMap: (strokeColor: string) => void;
  text: string;
  crosshair: boolean;
}

const MapComponent: FC<MapComponentProps> = ({
  center,
  text,
  children,
  crosshair,
  setStrokeColorInMap,
}) => {
  const appContext = useContext(AppContext);
  const mapRef = useRef<HTMLDivElement>(null);

  if (!appContext) throw new Error("AppContext is not defined");
  const { map, setMap, layers, updateAccuracy, updateInitialLocation, updateUserAdjustedLocation, currentLanguage } = appContext;
  // True while a GPS request is running (automatic locate, tap on the map or the locate button)
  const [locating, setLocating] = useState<boolean>(false);
  const locatingText = currentLanguage === "en" ? "Getting GPS location..." : "Haetaan GPS-sijaintia...";
  const stopLocating = () => setLocating(false);
  // Hide the "tap the map" hint straight away if this browser has already allowed
  // location; it comes back if locating fails.
  const [messageVisible, setMessageVisible] = useState<boolean>(
    () => getCookie(GEOLOCATION_COOKIE) !== "1"
  );
  const toast = useToast();
  const zoomLevel = useBreakpointValue({
    base: 4,
    sm: 4.2,
    md: 4.7
  });

  // Keep the latest zoomLevel and center in refs so the map-creation effect can
  // read them at build time without depending on them. Depending on zoomLevel
  // (which changes when the viewport crosses a Chakra breakpoint, e.g. on phone
  // rotation) would tear down and rebuild the map, discarding the user's pan,
  // zoom and marker. The map is built once and left alone thereafter.
  const zoomLevelRef = useRef(zoomLevel);
  zoomLevelRef.current = zoomLevel;
  const centerRef = useRef(center);
  centerRef.current = center;
  // The map instance auto-location has already run for (React StrictMode in dev
  // builds the map twice, so a plain boolean could lock onto a discarded map).
  const autoLocatedMapRef = useRef<Map | null>(null);

  const createLocateButton = useCallback(() => {
    const button = document.createElement("button");
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: auto;">
        <circle cx="12" cy="12" r="10" stroke="#666666" strokeWidth="2" fill="none"/>  
        <circle cx="12" cy="12" r="3" fill="#3182CE"/>  
        <line x1="12" y1="2" x2="12" y2="6" stroke="#666666" strokeWidth="2"/>  
        <line x1="12" y1="18" x2="12" y2="22" stroke="#666666" strokeWidth="2"/>  
        <line x1="2" y1="12" x2="6" y2="12" stroke="#666666" strokeWidth="2"/>  
        <line x1="18" y1="12" x2="22" y2="12" stroke="#666666" strokeWidth="2"/>
      </svg>
    `;
    button.className = "ol-locate-button";

    button.addEventListener("click", () => {
      setLocating(true);
      getCurrentPosition(map, updateInitialLocation, updateAccuracy, setMessageVisible, toast, undefined, stopLocating);
      setStrokeColorInMap("#7CB9E8");
      updateUserAdjustedLocation({ lat: null, lon: null });
    });

    return button;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, toast, setStrokeColorInMap, updateInitialLocation]);

  useEffect(() => {
    if (!mapRef.current) return;
    const newMap = new Map({
      target: mapRef.current,
      controls: defaultControls().extend([]),
      view: new View({
        projection: "EPSG:3857",
        center: fromLonLat(centerRef.current),
        zoom: zoomLevelRef.current,
      }),
    });

    newMap.addLayer(layers);
    setMap(newMap);

    return () => {
      newMap.setTarget(undefined);
      setMap(null);
    };
    // Built once on mount; rotation/resize must not rebuild the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;

    const click = map.on("click", () =>{
      setLocating(true);
      getCurrentPosition(map, updateInitialLocation, updateAccuracy, setMessageVisible, toast, undefined, stopLocating);
      setStrokeColorInMap("#7CB9E8");
      updateUserAdjustedLocation({ lat: null, lon: null });
    }
      
    );

    return () => {
      if (map) {
        unByKey(click);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, updateInitialLocation, updateAccuracy, toast]);

  // Locate automatically once the map exists if this browser has already allowed
  // location access: either our cookie from an earlier successful fix, or the
  // browser itself reports the permission as granted.
  useEffect(() => {
    if (!map || autoLocatedMapRef.current === map) return;
    let cancelled = false;

    const locate = () => {
      if (cancelled || autoLocatedMapRef.current === map) return;
      autoLocatedMapRef.current = map;
      console.info("Auto-locating: location was allowed earlier in this browser");
      // A spot picked by moving the map before the reload (kept for 12 h)
      const saved = loadAdjustedLocation();
      setStrokeColorInMap("#7CB9E8");
      setLocating(true);
      getCurrentPosition(map, updateInitialLocation, updateAccuracy, setMessageVisible, toast, () => {
        if (!saved || saved.lat === null || saved.lon === null) return;
        // GPS is still fetched (it is saved with the observation), but the
        // marker and view continue from the spot the user picked.
        updateUserAdjustedLocation(saved);
        updateAccuracy(5);
        setStrokeColorInMap("red");
        const around = circular([saved.lon, saved.lat], 150).transform("EPSG:4326", "EPSG:3857");
        map.getView().fit(around);
      }, stopLocating);
    };

    if (getCookie(GEOLOCATION_COOKIE) === "1") {
      locate();
    } else if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          if (status.state === "granted") locate();
        })
        .catch(() => {
          /* Permissions API not usable here; wait for a tap */
        });
    }

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    if (!map) return;
    const locateButton = createLocateButton();
    const zoomControl = document.getElementsByClassName("ol-zoom")[0];
    zoomControl.appendChild(locateButton);

    return () => {
      if (zoomControl && locateButton) {
        zoomControl.removeChild(locateButton);
      }
    };
  }, [map, createLocateButton]);

  return (
    <Box
      position="relative"
      height="100%"
      border="1px solid"
      borderColor="inherit"
      borderRadius="md"
      overflow="hidden"
    >
      <Box ref={mapRef} height="100%" width="100%">
        {children}
        <Box
          id="crosshair"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "2.7px",
            height: "160px",
            background: "green",
            transform: "translate(-50%, -50%)",
            display: crosshair ? "block" : "none",
            pointerEvents: "none",
            zIndex: 1000,
          }}
          _before={{
            content: '""',
            position: "absolute",
            top: "50%",
            left: "-70px",
            width: "140px",
            height: "2.7px",
            background: "green",
            transform: "translateY(-50%)",
          }}
        ></Box>
        {locating && (
          <Box
            position="absolute"
            top="40px"
            left={{ base: "56%", sm: "50%" }}
            transform="translateX(-50%)"
            backgroundColor="rgba(0, 0, 0, 0.55)"
            color="white"
            padding="8px 14px"
            borderRadius="4px"
            zIndex="101"
            pointerEvents="none"
            role="status"
            aria-live="polite"
          >
            <HStack spacing="10px">
              <Spinner size="sm" />
              <Text fontWeight={700}>{locatingText}</Text>
            </HStack>
          </Box>
        )}
        {messageVisible && !locating && (
          <Box
            position="absolute"
            top="40px"
            left={{ base: "56%", sm: "50%" }}
            transform="translateX(-50%)"
            backgroundColor="rgba(0, 0, 0, 0.2)"
            color="white"
            padding="8px"
            borderRadius="4px"
            width="80%"
            textAlign="center"
            fontWeight={900}
            zIndex="100"
            pointerEvents="none"
          >
            <Text>{text}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MapComponent;