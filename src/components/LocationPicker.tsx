import { useEffect, useRef, useState } from 'react';
import { getCurrentPosition } from '../utils';
import { PRESET_LOCATIONS } from '../types';

type Mode = 'preset' | 'manual';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Silent callback — GPS is captured in the background and stored for backend use. */
  onGps?: (coords: { lat: number; lng: number } | null) => void;
}

export default function LocationPicker({ label, value, onChange, onGps }: Props) {
  const [mode, setMode] = useState<Mode>('preset');
  const [gpsState, setGpsState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const requested = useRef(false);

  // Capture GPS silently the first time this picker mounts, and pass it up
  // so the backend always has coordinates regardless of which option the user picks.
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    setGpsState('loading');
    getCurrentPosition()
      .then((coords) => {
        onGps?.(coords);
        setGpsState('ok');
      })
      .catch(() => {
        onGps?.(null);
        setGpsState('error');
      });
  }, [onGps]);

  function pickPreset(loc: string) {
    setMode('preset');
    onChange(loc);
  }

  function switchManual() {
    setMode('manual');
    if ((PRESET_LOCATIONS as readonly string[]).includes(value)) {
      onChange('');
    }
  }

  return (
    <div className="field">
      <div className="field-label-row">
        <span className="field-label">{label}</span>
        <span className={`gps-status ${gpsState}`} aria-live="polite">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
          {gpsState === 'loading' && 'กำลังบันทึก GPS…'}
          {gpsState === 'ok' && 'บันทึก GPS แล้ว'}
          {gpsState === 'error' && 'ไม่มีสัญญาณ GPS'}
          {gpsState === 'idle' && ' '}
        </span>
      </div>
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

      {mode === 'manual' ? (
        <input
          className="input"
          placeholder="พิมพ์สถานที่"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : value ? (
        <p className="hint">เลือกแล้ว: {value}</p>
      ) : null}
    </div>
  );
}
