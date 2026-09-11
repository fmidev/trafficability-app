import { FC, useContext, useState } from 'react';
import MapComponent from '../../components/MapComponent/MapComponent';
import LayerComponent from '../../components/Layers/BaseLayer';
import MarkerLayer from '../../components/Layers/MarkerLayer';
import WMSLayerComponent from '../../components/Layers/WMSLayer';
import COGLayerComponent from '../../components/Layers/COGLayer';
import AppContext from '../../context/AppContext/AppContext';

interface MapViewProps {
  setCrosshair: (crosshair: boolean) => void;
  setStrokeColor: (strokeColor: string) => void;
  setMapStrokeColor: (strokeColor: string) => void;
  mapInfoText: string;
  strokeColor: string;
  crosshair: boolean;
}

type LayerMode = 'base' | 'wms' | 'cog' | 'both';

//const WMS_LEGEND_URL =
//  'https://sm.cryo-scope.eu/wms?service=WMS&request=GetLegendGraphic&version=1.3.0&sld_version=1.1.0&style=default&format=image%2Fpng&layer=gui%3Aisobands%3AXTRAFF_SWI1_ENSMEAN&width=300&height=250';
const WMS_LEGEND_URL = '/swclass_legend_v2.png';

// UI strings for the layer selector + legend + opacity slider, per language.
const L: Record<string, {
  base: string; swi: string; twi: string; both: string; swiTitle: string; dry: string; wet: string;
  showLegend: string; hideLegend: string; opacity: string;
}> = {
  fi: {
    base: 'Maastokartta',
    swi: 'XTRAFF maaston kosteus',
    twi: 'TWI',
    both: 'XTRAFF ja TWI',
    swiTitle: 'XTRAFF maaston kosteus',
    dry: 'Kuiva',
    wet: 'Märkä',
    showLegend: 'Näytä selite',
    hideLegend: 'Piilota selite',
    opacity: 'Peittävyys',
  },
  en: {
    base: 'Basemap',
    swi: 'XTRAFF soil wetness',
    twi: 'TWI',
    both: 'XTRAFF and TWI',
    swiTitle: 'XTRAFF soil wetness',
    dry: 'Dry',
    wet: 'Wet',
    showLegend: 'Show legend',
    hideLegend: 'Hide legend',
    opacity: 'Opacity',
  },
};

const MapView: FC<MapViewProps> = ({ setCrosshair, setStrokeColor, strokeColor, crosshair, setMapStrokeColor, mapInfoText }) => {
  const [layerMode, setLayerMode] = useState<LayerMode>('both');
  // Legend starts open on wide screens, collapsed on narrow (mobile) so it doesn't cover the map.
  const [legendOpen, setLegendOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
  );
  // Overlay opacity over the basemap, driven by the slider below the map.
  const [opacity, setOpacity] = useState<number>(0.7);

  const appContext = useContext(AppContext);
  const currentLanguage = appContext?.currentLanguage ?? 'fi';
  const t = L[currentLanguage] ?? L.fi;

  return (
    <div>
      <div style={{ position: 'relative', height: '75vh' }}>
        <MapComponent
          setStrokeColorInMap={setMapStrokeColor}
          crosshair={crosshair}
          center={[26.128804444, 65.322392778]}
          text={mapInfoText}>
          <LayerComponent layerName='maastokartta' />
          {(layerMode === 'wms' || layerMode === 'both') && <WMSLayerComponent opacity={opacity} />}
          {(layerMode === 'cog' || layerMode === 'both') && <COGLayerComponent opacity={opacity} />}
          <MarkerLayer
            setCrosshair={setCrosshair}
            setStrokeColor={setStrokeColor}
            strokeColor={strokeColor}
          />
        </MapComponent>

        {/* Layer selector */}
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000,
                      background: '#fff', padding: '8px 10px', borderRadius: 4,
                      boxShadow: '0 1px 4px rgba(0,0,0,.3)', font: '14px sans-serif' }}>
          <label style={{ display: 'block' }}>
            <input type="radio" name="layerMode" checked={layerMode === 'base'}
                   onChange={() => setLayerMode('base')} /> {t.base}
          </label>
          <label style={{ display: 'block' }}>
            <input type="radio" name="layerMode" checked={layerMode === 'wms'}
                   onChange={() => setLayerMode('wms')} /> {t.swi}
          </label>
          <label style={{ display: 'block' }}>
            <input type="radio" name="layerMode" checked={layerMode === 'cog'}
                   onChange={() => setLayerMode('cog')} /> {t.twi}
          </label>
          <label style={{ display: 'block' }}>
            <input type="radio" name="layerMode" checked={layerMode === 'both'}
                   onChange={() => setLayerMode('both')} /> {t.both}
          </label>
        </div>

        {/* Legend — toggleable; hidden in basemap-only mode. Button stays visible so the legend can be reopened. */}
        {layerMode !== 'base' && (
          <div style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 1000,
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <button
              type="button"
              onClick={() => setLegendOpen((o) => !o)}
              style={{ background: '#fff', border: 'none', borderRadius: 4,
                       boxShadow: '0 1px 4px rgba(0,0,0,.3)', padding: '6px 10px',
                       font: '14px sans-serif', cursor: 'pointer' }}>
              {legendOpen ? t.hideLegend : t.showLegend}
            </button>

            {legendOpen && (
              <div style={{ background: '#fff', padding: 6, borderRadius: 4,
                            boxShadow: '0 1px 4px rgba(0,0,0,.3)', font: '15px sans-serif',
                            display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                {(layerMode === 'wms' || layerMode === 'both') && (
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.swiTitle}</div>
                    <img src={WMS_LEGEND_URL} alt="XTRAFF SWI legend"
                         style={{ display: 'block', height: 290, width: 'auto' }} />
                  </div>
                )}
                {(layerMode === 'cog' || layerMode === 'both') && (
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>TWI</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span>{t.wet}</span>
                      <div style={{ width: 20, height: 245,
                        background: 'linear-gradient(to bottom, #1e1e1e, #ffffff)',
                        border: '1px solid #ccc' }} />
                      <span>{t.dry}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Opacity slider below the map; only meaningful when an overlay is shown. */}
      {layerMode !== 'base' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 4px', font: '14px sans-serif' }}>
          <span style={{ whiteSpace: 'nowrap' }}>{t.opacity}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ width: 44, textAlign: 'right' }}>{Math.round(opacity * 100)} %</span>
        </div>
      )}
    </div>
  );
};

export default MapView;