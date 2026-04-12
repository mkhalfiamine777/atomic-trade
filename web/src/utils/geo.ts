/**
 * Applies physical spread (orbit) to an object around a central point.
 * This is used to ensure shop activities (products, stories) don't stack directly
 * on top of the shop marker, but rather orbit around it.
 * 
 * Target range: between 15 meters and 35 meters.
 * 
 * @param centerLat Shop's fixed latitude
 * @param centerLng Shop's fixed longitude
 * @returns { lat, lng } New randomized coordinates in the orbit
 */
export function getOrbitLocation(centerLat: number, centerLng: number) {
    if (centerLat == null || centerLng == null) return { lat: centerLat, lng: centerLng }

    const RADIUS_MIN = 15; // 15 meters min
    const RADIUS_MAX = 35; // 35 meters max

    // 1. Generate a random distance between 15m and 35m
    const r = RADIUS_MIN + Math.random() * (RADIUS_MAX - RADIUS_MIN);

    // 2. Generate a random angle
    const theta = Math.random() * 2 * Math.PI;

    // 3. Convert meters to decimal degrees
    // (1 degree latitude is approx 111,320 meters)
    const latOffset = (r * Math.cos(theta)) / 111320;

    // (Longitude size varies based on latitude. We use cosine of latitude)
    const lngOffset = (r * Math.sin(theta)) / (111320 * Math.cos(centerLat * (Math.PI / 180)));

    return {
        lat: centerLat + latOffset,
        lng: centerLng + lngOffset
    };
}
