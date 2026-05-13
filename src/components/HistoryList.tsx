import type { CompletedTrip } from '../types';

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
                <span className="history-date">{t.date}</span>
              </div>
              <div className="history-route">
                <span>{t.originLocation}</span>
                <span className="arrow">→</span>
                <span>{t.destinationLocation}</span>
              </div>
              <div className="history-foot">
                <span className="muted">{t.driver}</span>
                <span className="mono">{distance.toLocaleString()} กม.</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
