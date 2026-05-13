import { useState } from 'react';
import type { CompletedTrip } from '../types';
import { formatDateThai } from '../utils';

interface Props {
  history: CompletedTrip[];
}

export default function HistoryList({ history }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (history.length === 0) return null;

  const visible = expanded ? history : history.slice(0, 1);
  const hiddenCount = history.length - 1;
  const hasMore = hiddenCount > 0;

  return (
    <section className="card history-card">
      <div className="card-header">
        <h2 className="card-title">ประวัติการวิ่ง</h2>
        <p className="card-sub">
          {history.length === 1 ? 'รอบล่าสุด' : `ทั้งหมด ${history.length} รอบ`}
        </p>
      </div>

      <ul className="history-list">
        {visible.map((t, i) => {
          const distance = t.destinationMileage - t.originMileage;
          return (
            <li key={`${t.completedAt}-${i}`} className="history-item">
              <div className="history-top">
                <span className="history-round">รอบที่ {t.roundNo}</span>
                <span className="history-date">{formatDateThai(t.date)}</span>
              </div>

              <div className="history-route">
                <span>{t.originLocation}</span>
                <span className="arrow">→</span>
                <span>{t.destinationLocation}</span>
              </div>

              <div className="mileage-row">
                <div className="mileage-cell">
                  <span className="mileage-label">ไมล์ต้นทาง</span>
                  <span className="mileage-value mono">
                    {t.originMileage.toLocaleString()}
                  </span>
                </div>
                <span className="mileage-arrow">→</span>
                <div className="mileage-cell">
                  <span className="mileage-label">ไมล์ปลายทาง</span>
                  <span className="mileage-value mono">
                    {t.destinationMileage.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="history-foot">
                <span className="muted">{t.driver}</span>
                <span className="mono">รวม {distance.toLocaleString()} กม.</span>
              </div>
            </li>
          );
        })}
      </ul>

      {hasMore ? (
        <button
          type="button"
          className="history-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <span>{expanded ? 'ย่อรายการ' : `ดูเพิ่มเติม (${hiddenCount} รายการ)`}</span>
          <svg
            className={`chevron ${expanded ? 'up' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      ) : null}
    </section>
  );
}
