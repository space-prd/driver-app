export type Driver = 'พีรดนย์' | 'พลรดี' | 'พรรณพรี';

export const DRIVERS: Driver[] = ['พีรดนย์', 'พลรดี', 'พรรณพรี'];

export const PRESET_LOCATIONS = ['โรงงาน1', 'โรงงาน2'] as const;

export interface OpenedTrip {
  plate: string;
  roundNo: number;
  date: string;
  driver: Driver;
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
