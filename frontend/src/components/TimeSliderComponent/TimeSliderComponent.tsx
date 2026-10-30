import { FC, useEffect } from "react";

interface TimeSliderProps {
  times: string[];          // ISO, sorted ascending
  index: number;
  setIndex: (i: number) => void;
  playing: boolean;
  setPlaying: (p: boolean) => void;
  language: string;
  frameMs?: number;
}

const T: Record<string, { play: string; pause: string; first: string; prev: string; next: string; last: string }> = {
  fi: { play: "Toista", pause: "Pysäytä", first: "Ensimmäinen", prev: "Edellinen", next: "Seuraava", last: "Viimeinen" },
  en: { play: "Play", pause: "Pause", first: "First", prev: "Previous", next: "Next", last: "Last" },
};

const isMidnightUtc = (iso: string) => iso.endsWith("T00:00:00Z");

const formatTime = (iso: string, language: string, withTime: boolean) => {
  const d = new Date(iso);
  const locale = language === "fi" ? "fi-FI" : "en-GB";
  const date = d.toLocaleDateString(locale, {
    weekday: "short", day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC",
  });
  if (!withTime) return date;
  const time = d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return `${date} ${time} UTC`;
};

const btn: React.CSSProperties = {
  background: "#fff", border: "1px solid #ccc", borderRadius: 4,
  padding: "2px 8px", font: "14px sans-serif", cursor: "pointer", minWidth: 32,
};

const TimeSliderComponent: FC<TimeSliderProps> = ({
  times, index, setIndex, playing, setPlaying, language, frameMs = 1200,
}) => {
  const t = T[language] ?? T.fi;
  const last = times.length - 1;

  // Advance one frame at a time while playing; loop back to the start.
  useEffect(() => {
    if (!playing || times.length < 2) return;
    const id = window.setInterval(() => {
      setIndex(index >= last ? 0 : index + 1);
    }, frameMs);
    return () => window.clearInterval(id);
  }, [playing, index, last, times.length, frameMs, setIndex]);

  if (!times.length) return null;

  const withTime = !times.every(isMidnightUtc);
  const go = (i: number) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(last, i)));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 4px", font: "14px sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button type="button" style={btn} title={t.first} aria-label={t.first} onClick={() => go(0)} disabled={index === 0}>⏮</button>
        <button type="button" style={btn} title={t.prev} aria-label={t.prev} onClick={() => go(index - 1)} disabled={index === 0}>◀</button>
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={index}
          onChange={(e) => go(parseInt(e.target.value, 10))}
          style={{ flex: 1 }}
        />
        <button type="button" style={btn} title={t.next} aria-label={t.next} onClick={() => go(index + 1)} disabled={index === last}>▶</button>
        <button type="button" style={btn} title={t.last} aria-label={t.last} onClick={() => go(last)} disabled={index === last}>⏭</button>
        <button type="button" style={{ ...btn, minWidth: 72 }} onClick={() => setPlaying(!playing)} disabled={times.length < 2}>
          {playing ? `⏸ ${t.pause}` : `⏵ ${t.play}`}
        </button>
      </div>
      <div>
        <strong>{formatTime(times[index], language, withTime)}</strong>
      </div>
    </div>
  );
};

export default TimeSliderComponent;