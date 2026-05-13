import type { Car, CompletedTrip, Driver, OpenedTrip } from '../types';
import type { GpsCoords } from '../utils';
import type { CarRow, DriverRow, TripRow } from './supabase';

export function rowToCar(row: CarRow): Car {
  return {
    id: row.id,
    plateNumber: row.plate_number,
    plateFull: row.plate_full,
    model: row.model,
  };
}

export function rowToDriver(row: DriverRow): Driver {
  return { id: row.id, name: row.name };
}

/** DB row → in-progress trip (caller asserts completed_at IS NULL). */
export function rowToOpened(row: TripRow): OpenedTrip {
  return {
    id: row.id,
    plate: row.plate,
    roundNo: row.round_no,
    date: row.date,
    driver: row.driver,
    originLocation: row.origin_location,
    originMileage: row.origin_mileage,
    originGps: pairToCoords(row.origin_gps_lat, row.origin_gps_lng),
    startedAt: row.started_at,
  };
}

/** DB row → completed trip (caller asserts destination + completed_at are filled). */
export function rowToCompleted(row: TripRow): CompletedTrip {
  return {
    ...rowToOpened(row),
    destinationLocation: row.destination_location ?? '',
    destinationMileage: row.destination_mileage ?? 0,
    destinationGps: pairToCoords(row.destination_gps_lat, row.destination_gps_lng),
    completedAt: row.completed_at ?? '',
  };
}

/** New OpenedTrip (without id) → INSERT payload for `trips`. */
export function openedToInsert(
  t: Omit<OpenedTrip, 'id'>,
): Omit<TripRow, 'id' | 'destination_location' | 'destination_mileage' | 'destination_gps_lat' | 'destination_gps_lng' | 'completed_at' | 'created_at' | 'updated_at'> {
  return {
    plate: t.plate,
    round_no: t.roundNo,
    date: t.date,
    driver: t.driver,
    origin_location: t.originLocation,
    origin_mileage: t.originMileage,
    origin_gps_lat: t.originGps?.lat ?? null,
    origin_gps_lng: t.originGps?.lng ?? null,
    started_at: t.startedAt,
  };
}

/** Close-trip data → UPDATE payload (stamps completed_at = now). */
export function closeUpdate(data: {
  destinationLocation: string;
  destinationMileage: number;
  destinationGps?: GpsCoords | null;
}): Pick<
  TripRow,
  | 'destination_location'
  | 'destination_mileage'
  | 'destination_gps_lat'
  | 'destination_gps_lng'
  | 'completed_at'
> {
  return {
    destination_location: data.destinationLocation,
    destination_mileage: data.destinationMileage,
    destination_gps_lat: data.destinationGps?.lat ?? null,
    destination_gps_lng: data.destinationGps?.lng ?? null,
    completed_at: new Date().toISOString(),
  };
}

function pairToCoords(lat: number | null, lng: number | null): GpsCoords | null {
  if (lat == null || lng == null) return null;
  return { lat: Number(lat), lng: Number(lng) };
}
