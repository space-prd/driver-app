import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OpenTripForm from '../components/OpenTripForm';
import CloseTripForm from '../components/CloseTripForm';
import HistoryList from '../components/HistoryList';
import {
  completeTrip,
  getActiveTrip,
  getCarByPlateNumber,
  getCompletedTrips,
  getDrivers,
  getNextRoundNumber,
  startTrip,
} from '../storage';
import type { Car, CompletedTrip, Driver, OpenedTrip } from '../types';
import { formatDate, formatDateThai } from '../utils';

type ToastKind = 'info' | 'error';

export default function TripPage() {
  const { plate = '' } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [carNotFound, setCarNotFound] = useState(false);
  const [activeTrip, setActiveTrip] = useState<OpenedTrip | null>(null);
  const [history, setHistory] = useState<CompletedTrip[]>([]);
  const [nextRound, setNextRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ text: string; kind: ToastKind } | null>(null);

  const today = formatDate();

  useEffect(() => {
    if (!plate) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setCarNotFound(false);
      try {
        // Validate the car first — bail early if not registered, so we don't
        // bother fetching trips/round number for an unknown plate.
        const carRow = await getCarByPlateNumber(plate);
        if (cancelled) return;
        if (!carRow) {
          setCar(null);
          setCarNotFound(true);
          return;
        }
        setCar(carRow);

        const [driverList, open, hist, round] = await Promise.all([
          getDrivers(),
          getActiveTrip(plate),
          getCompletedTrips(plate),
          getNextRoundNumber(plate, today),
        ]);
        if (cancelled) return;
        setDrivers(driverList);
        setActiveTrip(open);
        setHistory(hist);
        setNextRound(round);
      } catch (err) {
        if (!cancelled) showToast(errorMsg(err, 'โหลดข้อมูลล้มเหลว'), 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [plate, today]);

  function showToast(text: string, kind: ToastKind = 'info') {
    setToast({ text, kind });
    window.setTimeout(() => setToast(null), kind === 'error' ? 4000 : 2400);
  }

  async function handleOpen(
    data: Omit<OpenedTrip, 'id' | 'plate' | 'roundNo' | 'date' | 'startedAt'>,
  ) {
    if (busy) return;
    setBusy(true);
    try {
      const trip = await startTrip({
        plate,
        roundNo: nextRound,
        date: today,
        startedAt: new Date().toISOString(),
        ...data,
      });
      setActiveTrip(trip);
      showToast(`เปิดงานรอบที่ ${trip.roundNo} เรียบร้อย`);
    } catch (err) {
      showToast(errorMsg(err, 'เปิดงานล้มเหลว'), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleClose(
    data: Pick<CompletedTrip, 'destinationLocation' | 'destinationMileage' | 'destinationGps'>,
  ) {
    if (!activeTrip || busy) return;
    setBusy(true);
    try {
      const completed = await completeTrip(activeTrip.id, data);
      setActiveTrip(null);
      setHistory((prev) => [completed, ...prev]);
      setNextRound((n) => n + 1);
      showToast('ปิดงานเรียบร้อย ขอบคุณครับ');
    } catch (err) {
      showToast(errorMsg(err, 'ปิดงานล้มเหลว'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen trip-screen">
      <header className="trip-header">
        <div className="header-pill">
          <span className="header-label">ทะเบียนรถ</span>
          <span className="header-plate">{car?.plateFull ?? plate}</span>
          {car ? <span className="header-model">{car.model}</span> : null}
        </div>
        <div className="header-date">{formatDateThai(today)}</div>
      </header>

      {loading ? (
        <div className="card loading-card" aria-busy="true">
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      ) : carNotFound ? (
        <div className="card error-card">
          <div className="error-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h2 className="error-title">ไม่พบหมายเลขทะเบียนรถในระบบ</h2>
          <p className="error-body">
            ทะเบียน <span className="mono">{plate}</span> ยังไม่ได้ลงทะเบียนในระบบ
            <br />
            กรุณาติดต่อผู้ดูแลระบบ
          </p>
          <Link to="/" className="btn btn-ghost block">
            กลับหน้าหลัก
          </Link>
        </div>
      ) : (
        <>
          {activeTrip ? (
            <section className="card status-card">
              <div className="status-badge in-progress">
                <span className="dot" /> กำลังวิ่งงาน
              </div>
              <h2 className="status-title">รอบที่ {activeTrip.roundNo}</h2>
              <dl className="kv-list">
                <div className="kv">
                  <dt>คนขับ</dt>
                  <dd>{activeTrip.driver}</dd>
                </div>
                <div className="kv">
                  <dt>ต้นทาง</dt>
                  <dd>{activeTrip.originLocation}</dd>
                </div>
                <div className="kv">
                  <dt>เลขไมล์ต้นทาง</dt>
                  <dd className="mono">{activeTrip.originMileage.toLocaleString()} กม.</dd>
                </div>
              </dl>
            </section>
          ) : null}

          {activeTrip ? (
            <CloseTripForm
              onSubmit={handleClose}
              originMileage={activeTrip.originMileage}
              submitting={busy}
            />
          ) : (
            <OpenTripForm
              onSubmit={handleOpen}
              nextRound={nextRound}
              plate={plate}
              drivers={drivers}
              submitting={busy}
            />
          )}

          <HistoryList history={history} />
        </>
      )}

      {toast ? <div className={`toast toast-${toast.kind}`}>{toast.text}</div> : null}
    </div>
  );
}

function errorMsg(err: unknown, prefix: string): string {
  const detail = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
  return `${prefix}: ${detail}`;
}
