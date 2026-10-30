import { FC, useContext, useEffect, useMemo, useState } from 'react';
import MapComponent from '../../components/MapComponent/MapComponent';
import LayerComponent from '../../components/Layers/BaseLayer';
import MarkerLayer from '../../components/Layers/MarkerLayer';
import WMSLayerComponent from '../../components/Layers/WMSLayer';
import COGLayerComponent from '../../components/Layers/COGLayer';
import TimeSliderComponent from '../../components/TimeSliderComponent/TimeSliderComponent';
import AppContext from '../../context/AppContext/AppContext';
import { WMS_URL, LayerTimeInfo, getLayerTimeInfo } from '../../utils/wmsCapabilities';

interface MapViewProps {
  setCrosshair: (crosshair: boolean) => void;
  setStrokeColor: (strokeColor: string) => void;
  setMapStrokeColor: (strokeColor: string) => void;
  mapInfoText: string;
  strokeColor: string;
  crosshair: boolean;
}

type LayerMode = 'base' | 'wms' | 'cog' | 'both' | 'swe';

const XTRAFF_LAYER = 'gui:isobands:XTRAFF_SWI1_ENSMEAN';
const SWE_LAYER = 'gui:isobands:SWE-Scandinavia';

const WMS_LEGEND_URL = '/swclass_legend_v2.png';
// Legend canvas width in px; lower it to trim more empty space on the right.
const SWE_LEGEND_WIDTH = 95;
const SWE_LEGEND_URL =
  `${WMS_URL}?service=WMS&request=GetLegendGraphic&version=1.3.0&sld_version=1.1.0&style=default&format=image%2Fpng&layer=${encodeURIComponent(SWE_LAYER)}&width=${SWE_LEGEND_WIDTH}&height=290`;

// UI strings for the layer selector + legend + opacity slider, per language.
const L: Record<string, {
  base: string; swi: string; twi: string; both: string; swe: string; swiTitle: string; sweTitle: string;
  dry: string; wet: string; showLegend: string; hideLegend: string; opacity: string; noTimes: string;
}> = {
  fi: {
    base: 'Maastokartta',
    swi: 'XTRAFF maaston kosteus',
    twi: 'TWI',
    both: 'XTRAFF ja TWI',
    swe: 'Lumen vesiarvo (SWE)',
    swiTitle: 'XTRAFF maaston kosteus',
    sweTitle: 'Lumen vesiarvo (SWE)',
    dry: 'Kuiva',
    wet: 'Märkä',
    showLegend: 'Näytä selite',
    hideLegend: 'Piilota selite',
    opacity: 'Peittävyys',
    noTimes: 'Ennusteaikoja ei saatu haettua.',
  },
  en: {
    base: 'Basemap',
    swi: 'XTRAFF soil wetness',
    twi: 'TWI',
    both: 'XTRAFF and TWI',
    swe: 'Snow water equivalent (SWE)',
    swiTitle: 'XTRAFF soil wetness',
    sweTitle: 'Snow water equivalent (SWE)',
    dry: 'Dry',
    wet: 'Wet',
    showLegend: 'Show legend',
    hideLegend: 'Hide legend',
    opacity: 'Opacity',
    noTimes: 'Could not load forecast times.',
  },
};

// Nearest available time of a layer to the selected timeline time.
const nearest = (times: string[], target: string | null): string | null => {
  if (!target || !times.length) return null;
  if (times.includes(target)) return target;
  const tt = Date.parse(target);
  return times.reduce((a, b) => (Math.abs(Date.parse(b) - tt) < Math.abs(Date.parse(a) - tt) ? b : a));
};

// Default frame: the first time at or after today 00 UTC, else the last one.
const defaultIndex = (times: string[]): number => {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const i = times.findIndex((t) => Date.parse(t) >= today);
  return i >= 0 ? i : Math.max(0, times.length - 1);
};

const MapView: FC<MapViewProps> = ({ setCrosshair, setStrokeColor, strokeColor, crosshair, setMapStrokeColor, mapInfoText }) => {
  const [layerMode, setLayerMode] = useState<LayerMode>('both');
  // Legend starts open on wide screens, collapsed on narrow (mobile) so it doesn't cover the map.
  const [legendOpen, setLegendOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth > 768 : true
  );
  // Overlay opacity over the basemap, driven by the slider below the map.
  const [opacity, setOpacity] = useState<number>(0.7);

  // Forecast run + valid times per WMS layer, read from GetCapabilities.
  const [timeInfo, setTimeInfo] = useState<Record<string, LayerTimeInfo | null>>({});
  const [timesFailed, setTimesFailed] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const appContext = useContext(AppContext);
  const currentLanguage = appContext?.currentLanguage ?? 'fi';
  const t = L[currentLanguage] ?? L.fi;

  const showXtraff = layerMode === 'wms' || layerMode === 'both';
  const showTwi = layerMode === 'cog' || layerMode === 'both';
  const showSwe = layerMode === 'swe';

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([getLayerTimeInfo(XTRAFF_LAYER), getLayerTimeInfo(SWE_LAYER)]).then(([x, s]) => {
      if (cancelled) return;
      const info = {
        [XTRAFF_LAYER]: x.status === 'fulfilled' ? x.value : null,
        [SWE_LAYER]: s.status === 'fulfilled' ? s.value : null,
      };
      setTimeInfo(info);
      setTimesFailed(!info[XTRAFF_LAYER]?.times.length && !info[SWE_LAYER]?.times.length);
    });
    return () => { cancelled = true; };
  }, []);

  // Timeline = union of the valid times of the currently shown forecast layers.
  const activeLayers = useMemo(
    () => [showXtraff && XTRAFF_LAYER, showSwe && SWE_LAYER].filter(Boolean) as string[],
    [showXtraff, showSwe]
  );
  const timeline = useMemo(() => {
    const all = activeLayers.flatMap((l) => timeInfo[l]?.times ?? []);
    return [...new Set(all)].sort();
  }, [activeLayers, timeInfo]);

  // Keep the selection valid when the timeline changes (e.g. switching layers).
  useEffect(() => {
    if (!timeline.length) return;
    if (!selectedTime || !timeline.includes(selectedTime)) {
      setSelectedTime(selectedTime ? nearest(timeline, selectedTime) : timeline[defaultIndex(timeline)]);
    }
  }, [timeline, selectedTime]);

  // Stop the animation when no forecast layer is shown.
  useEffect(() => {
    if (!timeline.length) setPlaying(false);
  }, [timeline.length]);

  const index = selectedTime ? Math.max(0, timeline.indexOf(selectedTime)) : 0;

  const layerTime = (layer: string) => nearest(timeInfo[layer]?.times ?? [], selectedTime);

  const radio = (mode: LayerMode, label: string) => (
    <label style={{ display: 'block' }}>
      <input type="radio" name="layerMode" checked={layerMode === mode}
             onChange={() => setLayerMode(mode)} /> {label}
    </label>
  );

  return (
    <div>
      {/* Forecast time control (10-day forecast), shown when a forecast layer is on */}
      {activeLayers.length > 0 && (
        timeline.length > 0 ? (
          <TimeSliderComponent
            times={timeline}
            index={index}
            setIndex={(i) => setSelectedTime(timeline[i])}
            playing={playing}
            setPlaying={setPlaying}
            language={currentLanguage}
          />
        ) : timesFailed ? (
          <div style={{ padding: '8px 4px', font: '14px sans-serif', color: '#a00' }}>{t.noTimes}</div>
        ) : null
      )}

      <div style={{ position: 'relative', height: '75vh' }}>
        <MapComponent
          setStrokeColorInMap={setMapStrokeColor}
          crosshair={crosshair}
          center={[26.128804444, 65.322392778]}
          text={mapInfoText}>
          {/* <LayerComponent layerName='maastokartta' /> */}
          <LayerComponent layerName='mapnik' />
          {showXtraff && (
            <WMSLayerComponent
              layerName={XTRAFF_LAYER}
              opacity={opacity}
              time={layerTime(XTRAFF_LAYER)}
              originTime={timeInfo[XTRAFF_LAYER]?.originTime ?? null}
            />
          )}
          {showSwe && (
            <WMSLayerComponent
              layerName={SWE_LAYER}
              opacity={opacity}
              time={layerTime(SWE_LAYER)}
              originTime={timeInfo[SWE_LAYER]?.originTime ?? null}
            />
          )}
          {showTwi && <COGLayerComponent opacity={opacity} />}
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
          {radio('base', t.base)}
          {radio('wms', t.swi)}
          {radio('cog', t.twi)}
          {radio('both', t.both)}
          {radio('swe', t.swe)}
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
                {showXtraff && (
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.swiTitle}</div>
                    <img src={WMS_LEGEND_URL} alt="XTRAFF SWI legend"
                         style={{ display: 'block', height: 290, width: 'auto' }} />
                  </div>
                )}
                {showSwe && (
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.sweTitle}</div>
                    <img src={SWE_LEGEND_URL} alt="SWE legend"
                         style={{ display: 'block', height: 290, width: 'auto' }} />
                  </div>
                )}
                {showTwi && (
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