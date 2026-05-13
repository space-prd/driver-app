import type { CompletedTrip } from '../types';
import { formatDateThai } from '../utils';

interface Props {
  history: CompletedTrip[];
}

export default function HistoryList({ history }: Props) {
  if (history.length === 0) return null;

  return (
    <section className="card history-card">
      <div className="card-header">
        <h2 className="card-title">ประวัติการวิ่ง</h2>
        <p className="card-sub">{history.length} รอบล่าสุด</p>
      </div>
      <ul className="history-list">
        {history.slice(0, 8).map((t, i) => {
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
    </section>
  );
}
