import { useState } from 'react';
import LocationPicker from './LocationPicker';
import type { CompletedTrip } from '../types';

interface Props {
  originMileage: number;
  onSubmit: (
    data: Pick<CompletedTrip, 'destinationLocation' | 'destinationMileage' | 'destinationGps'>,
  ) => void;
}

export default function CloseTripForm({ originMileage, onSubmit }: Props) {
  const [destination, setDestination] = useState('');
  const [destGps, setDestGps] = useState<{ lat: number; lng: number } | null>(null);
  const [mileage, setMileage] = useState('');

  const mileageNum = Number(mileage);
  const validMileage = mileage !== '' && mileageNum >= originMileage;
  const canSubmit = destination.trim() !== '' && validMileage;
  const distance = validMileage ? mileageNum - originMileage : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      destinationLocation: destination.trim(),
      destinationMileage: mileageNum,
      destinationGps: destGps,
    });
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-header">
        <h2 className="card-title">ปิดงานรอบนี้</h2>
        <p className="card-sub">กรอกข้อมูลปลายทางเพื่อจบรอบ</p>
      </div>

      <LocationPicker
        label="สถานที่ปลายทาง"
        value={destination}
        onChange={setDestination}
        onGps={setDestGps}
      />

      <label className="field">
        <span className="field-label">เลขไมล์รถปลายทาง</span>
        <div className="input-suffix">
          <input
            className="input large mono"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={String(originMileage)}
            value={mileage}
            onChange={(e) => setMileage(e.target.value.replace(/[^0-9]/g, ''))}
          />
          <span className="suffix">กม.</span>
        </div>
        {mileage !== '' && !validMileage ? (
          <p className="hint error">
            ต้องไม่น้อยกว่าเลขไมล์ต้นทาง ({originMileage.toLocaleString()} กม.)
          </p>
        ) : null}
        {distance !== null ? (
          <p className="hint success">รวมระยะทาง {distance.toLocaleString()} กม.</p>
        ) : null}
      </label>

      <button type="submit" className="btn btn-success block" disabled={!canSubmit}>
        ปิดงาน เสร็จสิ้นรอบนี้
      </button>
    </form>
  );
}
