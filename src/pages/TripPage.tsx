import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import OpenTripForm from '../components/OpenTripForm';
import CloseTripForm from '../components/CloseTripForm';
import HistoryList from '../components/HistoryList';
import {
  appendHistory,
  clearOpenTrip,
  getHistory,
  getOpenTrip,
  nextRoundNumber,
  saveOpenTrip,
} from '../storage';
import type { CompletedTrip, OpenedTrip } from '../types';
import { formatDate } from '../utils';

export default function TripPage() {
  const { plate = '' } = useParams();
  const [openTrip, setOpenTrip] = useState<OpenedTrip | null>(null);
  const [history, setHistory] = useState<CompletedTrip[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setOpenTrip(getOpenTrip(plate));
    setHistory(getHistory(plate));
  }, [plate]);

  const today = useMemo(() => formatDate(), []);

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(null), 2400);
  }

  function handleOpen(data: Omit<OpenedTrip, 'plate' | 'roundNo' | 'date' | 'startedAt'>) {
    const date = formatDate();
    const trip: OpenedTrip = {
      plate,
      roundNo: nextRoundNumber(plate, date),
      date,
      startedAt: new Date().toISOString(),
      ...data,
    };
    saveOpenTrip(trip);
    setOpenTrip(trip);
    showToast(`เปิดงานรอบที่ ${trip.roundNo} เรียบร้อย`);
  }

  function handleClose(
    data: Pick<CompletedTrip, 'destinationLocation' | 'destinationMileage' | 'destinationGps'>,
  ) {
    if (!openTrip) return;
    const completed: CompletedTrip = {
      ...openTrip,
      ...data,
      completedAt: new Date().toISOString(),
    };
    appendHistory(completed);
    clearOpenTrip(plate);
    setOpenTrip(null);
    setHistory(getHistory(plate));
    showToast('ปิดงานเรียบร้อย ขอบคุณครับ');
  }

  return (
    <div className="screen trip-screen">
      <header className="trip-header">
        <div className="header-pill">
          <span className="header-label">ทะเบียนรถ</span>
          <span className="header-plate">{plate || '—'}</span>
        </div>
        <div className="header-date">{today}</div>
      </header>

      {openTrip ? (
        <section className="card status-card">
          <div className="status-badge in-progress">
            <span className="dot" /> กำลังวิ่งงาน
          </div>
          <h2 className="status-title">รอบที่ {openTrip.roundNo}</h2>
          <dl className="kv-list">
            <div className="kv">
              <dt>คนขับ</dt>
              <dd>{openTrip.driver}</dd>
            </div>
            <div className="kv">
              <dt>ต้นทาง</dt>
              <dd>{openTrip.originLocation}</dd>
            </div>
            <div className="kv">
              <dt>เลขไมล์ต้นทาง</dt>
              <dd className="mono">{openTrip.originMileage.toLocaleString()} กม.</dd>
            </div>
          </dl>
        </section>
      ) : null}

      {openTrip ? (
        <CloseTripForm onSubmit={handleClose} originMileage={openTrip.originMileage} />
      ) : (
        <OpenTripForm
          onSubmit={handleOpen}
          nextRound={nextRoundNumber(plate, today)}
          plate={plate}
        />
      )}

      <HistoryList history={history} />

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
