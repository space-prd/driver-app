import { useState } from 'react';
import { getCurrentPosition } from '../utils';
import { PRESET_LOCATIONS } from '../types';

type Mode = 'preset' | 'gps' | 'manual';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onGps?: (coords: { lat: number; lng: number } | null) => void;
}

export default function LocationPicker({ label, value, onChange, onGps }: Props) {
  const [mode, setMode] = useState<Mode>('preset');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  function pickPreset(loc: string) {
    setMode('preset');
    onChange(loc);
    onGps?.(null);
  }

  async function useGps() {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const coords = await getCurrentPosition();
      const text = `GPS: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
      onChange(text);
      onGps?.(coords);
      setMode('gps');
    } catch (err) {
      setGpsError(err instanceof Error ? err.message : 'ไม่สามารถดึงตำแหน่งได้');
    } finally {
      setGpsLoading(false);
    }
  }

  function switchManual() {
    setMode('manual');
    if (value.startsWith('GPS:') || (PRESET_LOCATIONS as readonly string[]).includes(value)) {
      onChange('');
    }
    onGps?.(null);
  }

  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="segmented">
        {PRESET_LOCATIONS.map((loc) => (
          <button
            key={loc}
            type="button"
            className={`seg ${mode === 'preset' && value === loc ? 'active' : ''}`}
            onClick={() => pickPreset(loc)}
          >
            {loc}
          </button>
        ))}
        <button
          type="button"
          className={`seg ${mode === 'manual' ? 'active' : ''}`}
          onClick={switchManual}
        >
          กรอกเอง
        </button>
      </div>

      <button type="button" className="btn btn-ghost gps-btn" onClick={useGps} disabled={gpsLoading}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9"/></svg>
        {gpsLoading ? 'กำลังหาตำแหน่ง…' : 'ใช้ตำแหน่ง GPS ปัจจุบัน'}
      </button>
      {gpsError ? <p className="hint error">{gpsError}</p> : null}

      {mode === 'manual' ? (
        <input
          className="input"
          placeholder="พิมพ์สถานที่"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : null}

      {value && mode !== 'manual' ? <p className="hint">เลือกแล้ว: {value}</p> : null}
    </div>
  );
}
