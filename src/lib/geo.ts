/**
 * Calculate distance between two coordinates in meters using the Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Verify if student coordinate is within classroom radius (with tolerance buffer)
 */
export function isWithinClassroomRadius(
  studentLat: number,
  studentLng: number,
  classLat: number,
  classLng: number,
  radiusMeters: number = 60,
  graceBufferMeters: number = 25
): { isInside: boolean; distanceMeters: number; maxAllowedMeters: number } {
  const distance = calculateDistanceMeters(studentLat, studentLng, classLat, classLng);
  const maxAllowed = radiusMeters + graceBufferMeters;
  return {
    isInside: distance <= maxAllowed,
    distanceMeters: distance,
    maxAllowedMeters: maxAllowed,
  };
}
