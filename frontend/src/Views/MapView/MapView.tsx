import { FC } from 'react';
import MapComponent from '../../components/MapComponent/MapComponent';
import LayerComponent from '../../components/Layers/BaseLayer';
import MarkerLayer from '../../components/Layers/MarkerLayer';

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
      <MarkerLayer 
        setCrosshair={setCrosshair} 
        setStrokeColor={setStrokeColor} 
        strokeColor={strokeColor}
      />
    </MapComponent>
  );
};

export default MapView;
