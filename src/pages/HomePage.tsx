import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const [plate, setPlate] = useState('');

  function go(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = plate.trim();
    if (!trimmed) return;
    navigate(`/${trimmed}`);
  }

  return (
    <div className="screen home-screen">
      <div className="home-hero">
        <div className="home-icon" aria-hidden>
          <svg
            viewBox="0 0 24 24"
            width="56"
            height="56"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M7 8h10M7 12h10M7 16h6" />
          </svg>
        </div>
        <h1 className="display-title">บันทึกการวิ่งรถ</h1>
        <p className="display-sub">สแกน QR Code ที่ติดอยู่บนรถเพื่อเริ่มงาน</p>
      </div>

      <form className="card home-form" onSubmit={go}>
        <label className="field">
          <span className="field-label">ทะเบียนรถ (สำหรับทดสอบ)</span>
          <input
            className="input large center mono"
            inputMode="numeric"
            placeholder="0349"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            autoFocus
          />
        </label>
        <button type="submit" className="btn btn-primary block" disabled={!plate.trim()}>
          เปิดงานรถคันนี้
        </button>
      </form>
    </div>
  );
}
