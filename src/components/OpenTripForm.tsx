import { useState } from 'react';
import LocationPicker from './LocationPicker';
import { DRIVERS, type Driver, type OpenedTrip } from '../types';

interface Props {
  plate: string;
  nextRound: number;
  onSubmit: (data: Omit<OpenedTrip, 'plate' | 'roundNo' | 'date' | 'startedAt'>) => void;
}

export default function OpenTripForm({ plate, nextRound, onSubmit }: Props) {
  const [driver, setDriver] = useState<Driver | ''>('');
  const [origin, setOrigin] = useState('');
  const [originGps, setOriginGps] = useState<{ lat: number; lng: number } | null>(null);
  const [mileage, setMileage] = useState('');

  const canSubmit = driver !== '' && origin.trim() !== '' && mileage.trim() !== '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      driver: driver as Driver,
      originLocation: origin.trim(),
      originMileage: Number(mileage),
      originGps,
    });
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-header">
        <h2 className="card-title">เปิดงานรอบใหม่</h2>
        <p className="card-sub">
          รถ <strong className="mono">{plate}</strong> · รอบที่ {nextRound}
        </p>
      </div>

      <label className="field">
        <span className="field-label">ชื่อคนขับรถ</span>
        <div className="select-wrap">
          <select
            className="input select"
            value={driver}
            onChange={(e) => setDriver(e.target.value as Driver)}
          >
            <option value="" disabled>
              เลือกคนขับ…
            </option>
            {DRIVERS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <span className="select-caret" aria-hidden>▾</span>
        </div>
      </label>

      <LocationPicker
        label="สถานที่ต้นทาง"
        value={origin}
        onChange={setOrigin}
        onGps={setOriginGps}
      />

      <label className="field">
        <span className="field-label">เลขไมล์รถต้นทาง</span>
        <div className="input-suffix">
          <input
            className="input large mono"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            value={mileage}
            onChange={(e) => setMileage(e.target.value.replace(/[^0-9]/g, ''))}
          />
          <span className="suffix">กม.</span>
        </div>
      </label>

      <button type="submit" className="btn btn-primary block" disabled={!canSubmit}>
        เริ่มวิ่งรอบนี้
      </button>
    </form>
  );
}
