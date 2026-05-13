import { supabase, type CarRow, type DriverRow, type TripRow } from './lib/supabase';
import {
  closeUpdate,
  openedToInsert,
  rowToCar,
  rowToCompleted,
  rowToDriver,
  rowToOpened,
} from './lib/mappers';
import type { Car, CompletedTrip, Driver, OpenedTrip } from './types';
import type { GpsCoords } from './utils';

const TABLE = 'trips';
const CARS = 'cars';
const DRIVERS = 'drivers';

/** Look up a car by its short plate number (the URL parameter). Returns null if not registered. */
export async function getCarByPlateNumber(plateNumber: string): Promise<Car | null> {
  const { data, error } = await supabase
    .from(CARS)
    .select('*')
    .eq('plate_number', plateNumber)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToCar(data as CarRow) : null;
}

/** All active drivers, sorted for the dropdown. */
export async function getDrivers(): Promise<Driver[]> {
  const { data, error } = await supabase
    .from(DRIVERS)
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => rowToDriver(r as DriverRow));
}

/** Returns the currently-open trip for `plate`, or null. */
export async function getActiveTrip(plate: string): Promise<OpenedTrip | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('plate', plate)
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToOpened(data as TripRow) : null;
}

/** Inserts a new in-progress trip, returns the saved row (with id). */
export async function startTrip(input: Omit<OpenedTrip, 'id'>): Promise<OpenedTrip> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(openedToInsert(input))
    .select()
    .single();

  if (error) throw error;
  return rowToOpened(data as TripRow);
}

/** Stamps destination + completed_at on an existing row, returns the completed trip. */
export async function completeTrip(
  id: string,
  data: {
    destinationLocation: string;
    destinationMileage: number;
    destinationGps?: GpsCoords | null;
  },
): Promise<CompletedTrip> {
  const { data: row, error } = await supabase
    .from(TABLE)
    .update(closeUpdate(data))
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToCompleted(row as TripRow);
}

/** Most recent completed trips for `plate`, newest first. */
export async function getCompletedTrips(plate: string, limit = 50): Promise<CompletedTrip[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('plate', plate)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((r) => rowToCompleted(r as TripRow));
}

/**
 * Counts ALL rows (open + completed) for plate+date, returns count+1.
 * So opening round 1 then opening another (without closing the first) gives round 2.
 */
export async function getNextRoundNumber(plate: string, date: string): Promise<number> {
  const { count, error } = await supabase
    .from(TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('plate', plate)
    .eq('date', date);

  if (error) throw error;
  return (count ?? 0) + 1;
}
