import type { CompletedTrip, OpenedTrip } from './types';

const OPEN_KEY = (plate: string) => `truck:open:${plate}`;
const HISTORY_KEY = (plate: string) => `truck:history:${plate}`;

export function getOpenTrip(plate: string): OpenedTrip | null {
  try {
    const raw = localStorage.getItem(OPEN_KEY(plate));
    return raw ? (JSON.parse(raw) as OpenedTrip) : null;
  } catch {
    return null;
  }
}

export function saveOpenTrip(trip: OpenedTrip): void {
  localStorage.setItem(OPEN_KEY(trip.plate), JSON.stringify(trip));
}

export function clearOpenTrip(plate: string): void {
  localStorage.removeItem(OPEN_KEY(plate));
}

export function getHistory(plate: string): CompletedTrip[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY(plate));
    return raw ? (JSON.parse(raw) as CompletedTrip[]) : [];
  } catch {
    return [];
  }
}

export function appendHistory(trip: CompletedTrip): void {
  const list = getHistory(trip.plate);
  list.unshift(trip);
  localStorage.setItem(HISTORY_KEY(trip.plate), JSON.stringify(list));
}

export function nextRoundNumber(plate: string, date: string): number {
  const history = getHistory(plate);
  const todayCount = history.filter((t) => t.date === date).length;
  return todayCount + 1;
}
