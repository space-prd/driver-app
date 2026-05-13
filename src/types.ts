export interface Driver {
  id: string;
  name: string;
}

export interface Car {
  id: string;
  /** Numeric/short plate used in URL, e.g. "1853". */
  plateNumber: string;
  /** Full plate for display, e.g. "งฉ 1853". */
  plateFull: string;
  /** Vehicle model, e.g. "Toyota Revo". */
  model: string;
}

export const PRESET_LOCATIONS = ['โรงงาน1', 'โรงงาน2'] as const;

export interface OpenedTrip {
  id: string;
  plate: string;
  roundNo: number;
  /** ISO YYYY-MM-DD (Postgres date column). Use formatDateThai() for display. */
  date: string;
  /** Driver's name (stored as text in trips.driver). */
  driver: string;
  originLocation: string;
  originMileage: number;
  originGps?: { lat: number; lng: number } | null;
  startedAt: string;
}

export interface CompletedTrip extends OpenedTrip {
  destinationLocation: string;
  destinationMileage: number;
  destinationGps?: { lat: number; lng: number } | null;
  completedAt: string;
}
