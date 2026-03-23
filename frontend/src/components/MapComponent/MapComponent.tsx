import {
  FC,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Box, Text, useToast, useBreakpointValue } from "@chakra-ui/react";
import { Map, View } from "ol";
import { defaults as defaultControls } from "ol/control";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import proj4 from "proj4";
import { register } from "ol/proj/proj4.js";
import AppContext from "../../context/AppContext/AppContext";
import { unByKey } from "ol/Observable";
import { getCurrentPosition } from "../../utils/geolocationHandlers";

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
  const { map, setMap, layers, updateAccuracy, updateInitialLocation, updateUserAdjustedLocation } = appContext;
  const [messageVisible, setMessageVisible] = useState<boolean>(true);
  const toast = useToast();
  const zoomLevel = useBreakpointValue({
    base: 4,
    sm: 4.2,
    md: 4.7
  });

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
      getCurrentPosition(map, updateInitialLocation, updateAccuracy, setMessageVisible, toast);
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
        center: fromLonLat(center),
        zoom: zoomLevel// 5.05 //4.15,
      }),
    });

    newMap.addLayer(layers);
    setMap(newMap);

    return () => {
      newMap.setTarget(undefined);
      setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomLevel]);

  useEffect(() => {
    if (!map) return;

    const click = map.on("click", () =>{
      getCurrentPosition(map, updateInitialLocation, updateAccuracy, setMessageVisible, toast)
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
            left: "-62px",
            width: "140px",
            height: "2.7px",
            background: "green",
            transform: "translateY(-50%)",
          }}
        ></Box>
        {messageVisible && (
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
