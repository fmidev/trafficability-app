import { Options as WMTSOptions } from 'ol/source/WMTS.js';
import { vi } from 'vitest';
import LayerGroup from 'ol/layer/Group';

const mockUpdateContestantName = vi.fn();
const mockUpdateAnswer = vi.fn();
const option: WMTSOptions[] = []

const mockAppContextValue = {
  currentLanguage: 'fi',
  fileDateTime: '',
  fileGeoLocation:  { lon: null, lat: null},
  accuracy: 20,
  answer: '',
  check: false,
  contestantName: 'Initial contestantName',
  file: { data: '', name: '' },
  photo: '',
  initialLocation: { lon: null, lat: null, accuracy: 20, },
  userAdjustedLocation: { lon: null, lat: null, accuracy: 20, },
  pictureName: '',
  crosshair: false,
  evaluateAnswer: '',
  layers: new LayerGroup(),
  mobilePicture: {  data: '', name: '' },
  picture: {data: '', name: ''},
  image: null,
  map: null,
  options: option,
  strokeColor: "#7CB9E8",
  updateFileGeoLocation: vi.fn(),
  updateAnswer: mockUpdateAnswer,
  updateContestantName: mockUpdateContestantName,
  updateFile: vi.fn(),
  updatePhoto: vi.fn(),
  updatePosition: vi.fn(),
  updatePictureName:vi.fn(),
  setMap: vi.fn(),
  setLayers: vi.fn(),
  updateOptions: vi.fn(),
  updateEvaluateAnswer: vi.fn(),
  updatePicture: vi.fn(),
  updateImage: vi.fn(),
  updateMobilePicture: vi.fn(),
  updateCrosshair: vi.fn(),
  updateStrokeColor: vi.fn(),
  updateInitialLocation: vi.fn(),
  updateUserAdjustedLocation: vi.fn(),
  updateAccuracy: vi.fn(), 
  updateCheck: vi.fn(),
  setLanguage: vi.fn(),
  setfileDateTime: vi.fn(),
}

export { mockAppContextValue, mockUpdateContestantName, mockUpdateAnswer };