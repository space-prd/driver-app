import type { Car, CompletedTrip } from '../types';

const WEBHOOK_URL = import.meta.env.VITE_POWER_AUTOMATE_URL;

/**
 * Payload shape sent to Power Automate "When a HTTP request is received".
 * Flat snake_case keys so Dynamic content tokens map cleanly in the flow.
 */
export interface TripWebhookPayload {
  id: string;
  plate_number: string;
  plate_full: string;
  vehicle_model: string;
  round_no: number;
  date: string;
  driver: string;
  origin_location: string;
  origin_mileage: number;
  origin_gps_lat: number | null;
  origin_gps_lng: number | null;
  destination_location: string;
  destination_mileage: number;
  destination_gps_lat: number | null;
  destination_gps_lng: number | null;
  distance_km: number;
  started_at: string;
  completed_at: string;
}

function buildPayload(trip: CompletedTrip, car: Car | null): TripWebhookPayload {
  return {
    id: trip.id,
    plate_number: trip.plate,
    plate_full: car?.plateFull ?? trip.plate,
    vehicle_model: car?.model ?? '',
    round_no: trip.roundNo,
    date: trip.date,
    driver: trip.driver,
    origin_location: trip.originLocation,
    origin_mileage: trip.originMileage,
    origin_gps_lat: trip.originGps?.lat ?? null,
    origin_gps_lng: trip.originGps?.lng ?? null,
    destination_location: trip.destinationLocation,
    destination_mileage: trip.destinationMileage,
    destination_gps_lat: trip.destinationGps?.lat ?? null,
    destination_gps_lng: trip.destinationGps?.lng ?? null,
    distance_km: trip.destinationMileage - trip.originMileage,
    started_at: trip.startedAt,
    completed_at: trip.completedAt,
  };
}

/**
 * POSTs a completed trip to Power Automate. Throws on HTTP error or network failure.
 * No-op (returns immediately) if VITE_POWER_AUTOMATE_URL is not configured.
 */
export async function postTripWebhook(trip: CompletedTrip, car: Car | null): Promise<void> {
  if (!WEBHOOK_URL) {
    console.warn('[webhook] VITE_POWER_AUTOMATE_URL not set — skipping webhook');
    return;
  }

  const payload = buildPayload(trip, car);

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}${text ? ` — ${text.slice(0, 200)}` : ''}`);
  }
}
