import { FC } from 'react';
import MapComponent from '../../components/MapComponent/MapComponent';
import LayerComponent from '../../components/Layers/BaseLayer';
import MarkerLayer from '../../components/Layers/MarkerLayer';
// import { CO } from 'country-flag-icons/react/3x2';
// import { BsColumnsGap } from 'react-icons/bs';
// import COGLayer from '../../components/Layers/COGLayer';
import WMSLayerComponent from '../../components/Layers/WMSLayer';

interface MapViewProps {
  setCrosshair: (crosshair: boolean) => void;
  setStrokeColor: (strokeColor: string) => void;
  setMapStrokeColor: (strokeColor: string) => void;
  mapInfoText: string;
  strokeColor: string;
  crosshair: boolean;
}
const MapView: FC<MapViewProps> = ({ setCrosshair, setStrokeColor, strokeColor, crosshair, setMapStrokeColor, mapInfoText }) => {
 
  return (
    <MapComponent
      setStrokeColorInMap={setMapStrokeColor}
      crosshair={crosshair}
      center={[ 26.128804444, 65.322392778]} 
      text={mapInfoText}>
      <LayerComponent layerName='maastokartta' />
      {/* <COGLayer /> */}
      <WMSLayerComponent />
      <MarkerLayer 
        setCrosshair={setCrosshair} 
        setStrokeColor={setStrokeColor} 
        strokeColor={strokeColor}
      />
    </MapComponent>
  );
};

export default MapView;
