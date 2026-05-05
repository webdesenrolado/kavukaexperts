/**
 * Distância em km entre dois pontos lat/lng (haversine).
 */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function parseLatLng(lat: string | null, lng: string | null): { lat: number; lng: number } | null {
  if (!lat || !lng) return null;
  const la = parseFloat(lat);
  const lo = parseFloat(lng);
  if (!isFinite(la) || !isFinite(lo)) return null;
  return { lat: la, lng: lo };
}
