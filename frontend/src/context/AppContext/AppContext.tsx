import { createContext, useState, ReactNode, FC } from "react";
import { Position, AppContextType } from "../../types";
import { Options as WMTSOptions } from "ol/source/WMTS.js";
import { Map } from "ol";
import LayerGroup from "ol/layer/Group";

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider: FC<AppProviderProps> = ({ children }) => {
  const [answer, setAnswer] = useState<string>("");
  const [check, setCheck] = useState<boolean>(false);
  const [contestantName, setContestantName] = useState<string>("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>("fi");
  const [initialLocation, setOriginalLocation] = useState<Position>({
    lon: null,
    lat: null,
    accurracy: null,
  });
  const [fileGeoLocation, setFileGeoLocation] = useState<Position>({
    lon: null,
    lat: null,
  });
  const [userAdjustedLocation, setUserAdjusttedLocation] = useState<Position>({
    lon: null,
    lat: null,
  });
  const [file, setFile] = useState<{ data: File | string; name: string }>({
    data: "",
    name: "",
  });
  const [options, updateOptions] = useState<WMTSOptions[] | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [layers, setLayers] = useState<LayerGroup>(new LayerGroup());
  const [picture, setPicture] = useState<{ data: File | string; name: string }>(
    { data: "", name: "" }
  );
  const [fileDateTime, setFileDateTime] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [evaluateAnswer, setEvaluateAnswer] = useState<string>("");
  const [mobilePicture, setMobilePicture] = useState<{
    data: File | string;
    name: string;
  }>({ data: "", name: "" });
  const [crosshair, setCrosshair] = useState<boolean>(false);
  const [strokeColor, setStrokeColor] = useState<string>("#7CB9E8");
  const updateAnswer = (answer: string) => setAnswer(answer);
  const updateFile = (file: { data: File | string; name: string }) =>
    setFile({ data: file.data, name: file instanceof File ? file.name : "" });
  const updateContestantName = (contestantName: string) =>
    setContestantName(contestantName);
  const updateImage = (image: string | null) => setImage(image);
  const updatePicture = (picture: { data: File | string; name: string }) =>
    setPicture({ data: picture.data, name: picture.name });
  const updateEvaluateAnswer = (evaluateAnswer: string) =>
    setEvaluateAnswer(evaluateAnswer);
  const updateMobilePicture = (pic: { data: File | string; name: string }) =>
    setMobilePicture({ data: pic.data, name: pic.name });
  const updateCrosshair = (crosshair: boolean) => setCrosshair(crosshair);
  const updateStrokeColor = (strokeColor: string) =>
    setStrokeColor(strokeColor);
  const updateInitialLocation = (initialLocation: Position) =>
    setOriginalLocation({
      lon: initialLocation.lon,
      lat: initialLocation.lat,
      accurracy: initialLocation.accurracy,
    });
  const updateFileGeoLocation = (fileGeoLocation: Position) =>
    setFileGeoLocation({
      lon: fileGeoLocation.lon,
      lat: fileGeoLocation.lat,
    });
  const updateUserAdjustedLocation = (userAdjustedLocation: Position) =>
    setUserAdjusttedLocation({
      lon: userAdjustedLocation.lon,
      lat: userAdjustedLocation.lat,
    });
  const updateAccuracy = (accuracy: number | null) => setAccuracy(accuracy);
  const updateCheck = (check: boolean) => setCheck(check);
  const setLanguage = (language: string) => setCurrentLanguage(language);
  const setfileDateTime = (fileDateTimeOriginal: string) =>
    setFileDateTime(fileDateTimeOriginal);

  return (
    <AppContext.Provider
      value={{
        fileDateTime,
        fileGeoLocation,
        currentLanguage,
        accuracy,
        userAdjustedLocation,
        initialLocation,
        strokeColor,
        crosshair,
        answer,
        evaluateAnswer,
        contestantName,
        file,
        options,
        map,
        layers,
        image,
        picture,
        mobilePicture,
        check,
        setfileDateTime,
        updateCheck,
        setLayers,
        setLanguage,
        setMap,
        updateAnswer,
        updateEvaluateAnswer,
        updateFile,
        updateContestantName,
        updateOptions,
        updatePicture,
        updateImage,
        updateMobilePicture,
        updateCrosshair,
        updateStrokeColor,
        updateInitialLocation,
        updateUserAdjustedLocation,
        updateAccuracy,
        updateFileGeoLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
