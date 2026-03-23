import { Map } from 'ol';
import LayerGroup from 'ol/layer/Group'; 
import { Options as WMTSOptions } from 'ol/source/WMTS.js';

export type AppData = {
  answer: string;
  accuracy: number | null,
  evaluateAnswer: string;
  initialLocation: Position;
  userAdjustedLocation: Position;
  file: { data: File | string, name: string };
  fileDateTime: string;
  fileGeoLocation: Position
  contestantName: string;
  check: boolean;
};

export type Position = {
  lat: null | number,
  lon: null | number,
  accurracy?: null | number
}

export type AppContextType = {
  fileDateTime: string;
  fileGeoLocation: Position;
  currentLanguage: string;
  accuracy: number | null,
  crosshair: boolean;
  answer: string;
  evaluateAnswer: string;
  initialLocation: Position;
  userAdjustedLocation: Position;
  file: { data: File | string, name: string }; 
  contestantName: string;
  map: Map | null;
	layers: LayerGroup;
  options: WMTSOptions[] | null;
  mobilePicture: { data: File | string, name: string }; 
  picture: {data: File | string, name: string};
  image: string | null;
  strokeColor: string;
  check: boolean;
  setfileDateTime: (fileDateTime: string) => void;
  setLanguage: (language: string) => void;
  setMap: (map: Map | null) => void;
  setLayers: (layers: LayerGroup) => void;
  updateAnswer: (answer: string) => void;
  updateEvaluateAnswer: (evaluateAnswer: string) => void;
  updateInitialLocation: (initialLocation: Position) => void;
  updateFileGeoLocation: (initialLocation: Position) => void;
  updateUserAdjustedLocation: (userAdjustedLocation: Position) => void;
  updateFile: (file: {data: File | string, name: string}) => void; 
  updatePicture: (pictureData: {data: File | string, name: string}) => void;
  updateContestantName: (contestantName: string) => void;
  updateOptions: (options: WMTSOptions[] | null) => void;
  updateImage: (image: string | null) => void;
  updateMobilePicture: (picture: {data: File | string, name: string}) => void; 
  updateCrosshair: (crosshair: boolean) => void;
  updateStrokeColor: (strokeColor: string) => void;
  updateAccuracy: (accuracy: number | null) => void; 
  updateCheck: (check: boolean) => void;
};
