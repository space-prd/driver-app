import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
// Supports both the legacy "anon key" name and the modern "publishable key" name.
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in .env.local, ' +
      'then restart the dev server.',
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export interface CarRow {
  id: string;
  plate_number: string;
  plate_full: string;
  model: string;
  is_active: boolean;
  created_at?: string;
}

export interface DriverRow {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

/**
 * Raw row shape as stored in the `trips` table.
 * snake_case to match Postgres conventions.
 */
export interface TripRow {
  id: string;
  plate: string;
  round_no: number;
  date: string; // ISO YYYY-MM-DD
  driver: string;
  origin_location: string;
  origin_mileage: number;
  origin_gps_lat: number | null;
  origin_gps_lng: number | null;
  started_at: string;
  destination_location: string | null;
  destination_mileage: number | null;
  destination_gps_lat: number | null;
  destination_gps_lng: number | null;
  completed_at: string | null;
  created_at?: string;
  updated_at?: string;
}
