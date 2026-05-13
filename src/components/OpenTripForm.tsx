import { useState } from 'react';
import LocationPicker from './LocationPicker';
import type { Driver, OpenedTrip } from '../types';

interface Props {
  plate: string;
  nextRound: number;
  drivers: Driver[];
  submitting?: boolean;
  onSubmit: (data: Omit<OpenedTrip, 'id' | 'plate' | 'roundNo' | 'date' | 'startedAt'>) => void;
}

export default function OpenTripForm({
  plate,
  nextRound,
  drivers,
  submitting = false,
  onSubmit,
}: Props) {
  const [driver, setDriver] = useState('');
  const [origin, setOrigin] = useState('');
  const [originGps, setOriginGps] = useState<{ lat: number; lng: number } | null>(null);
  const [mileage, setMileage] = useState('');

  const canSubmit = driver !== '' && origin.trim() !== '' && mileage.trim() !== '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      driver,
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
            onChange={(e) => setDriver(e.target.value)}
            disabled={drivers.length === 0}
          >
            <option value="" disabled>
              {drivers.length === 0 ? 'ยังไม่มีคนขับในระบบ' : 'เลือกคนขับ…'}
            </option>
            {drivers.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
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

      <button
        type="submit"
        className="btn btn-primary block"
        disabled={!canSubmit || submitting}
      >
        {submitting ? 'กำลังบันทึก…' : 'เริ่มวิ่งรอบนี้'}
      </button>
    </form>
  );
}
