export const ORX = [43.6036, -1.3767];
export const BIKE_KMH = 20;
export const GOOD_TRIP_MIN = 30;
export const GOOD_SCORE = 3;

/**
 * Fetch one route from Orx to an offer on routing.openstreetmap.de.
 * Returns { mode, km, minutes, geometry }; bike time uses BIKE_KMH.
 */
export async function fetchRoute(offer, mode) {
  const profile = mode === "bike" ? "routed-bike" : "routed-car";
  const url = `https://routing.openstreetmap.de/${profile}/route/v1/driving/${ORX[1]},${ORX[0]};${offer.lon},${offer.lat}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`routing ${response.status}`);
  const [route] = (await response.json()).routes;
  const km = route.distance / 1000;
  const minutes = mode === "bike" ? (km / BIKE_KMH) * 60 : route.duration / 60;
  return { mode, km, minutes, geometry: route.geometry };
}

/** Bike and car routes, fetched together; a failed one is left out. */
export async function fetchRoutes(offer) {
  const results = await Promise.allSettled(["bike", "car"].map((mode) => fetchRoute(offer, mode)));
  return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
}
