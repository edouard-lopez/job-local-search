export const ORX = [43.6036, -1.3767];
export const BIKE_KMH = 20;
/** Below this road distance, the route is computed by bike; above it, by car. */
export const BIKE_MAX_KM = 20;
export const GOOD_TRIP_MIN = 30;
export const GOOD_SCORE = 3;

/**
 * Fetch a route from Orx to an offer on routing.openstreetmap.de.
 * Returns { mode, km, minutes, geometry }.
 */
export async function fetchRoute(offer) {
  const mode = offer.distance_km < BIKE_MAX_KM ? "bike" : "car";
  const profile = mode === "bike" ? "routed-bike" : "routed-car";
  const url = `https://routing.openstreetmap.de/${profile}/route/v1/driving/${ORX[1]},${ORX[0]};${offer.lon},${offer.lat}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`routing ${response.status}`);
  const [route] = (await response.json()).routes;
  const km = route.distance / 1000;
  const minutes = mode === "bike" ? (km / BIKE_KMH) * 60 : route.duration / 60;
  return { mode, km, minutes, geometry: route.geometry };
}
