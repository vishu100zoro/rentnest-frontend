/**
 * Calculate great-circle distance in kilometers between two lat/lng coordinates
 * using the Haversine formula.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number'
  ) {
    return null;
  }

  const toRadians = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export const FALLBACK_HUBS = [
  { label: 'Salt Lake Sector V, Kolkata', city: 'Kolkata', lat: 22.5735, lng: 88.4331 },
  { label: 'Park Street, Kolkata', city: 'Kolkata', lat: 22.5515, lng: 88.3527 },
  { label: 'Jadavpur, Kolkata', city: 'Kolkata', lat: 22.4989, lng: 88.3687 },
  { label: 'Koramangala, Bangalore', city: 'Bangalore', lat: 12.9352, lng: 77.6245 },
  { label: 'Hinjewadi, Pune', city: 'Pune', lat: 18.5913, lng: 73.7389 },
  { label: 'Madhapur, Hyderabad', city: 'Hyderabad', lat: 17.4435, lng: 78.3914 },
  { label: 'North Campus, Delhi', city: 'Delhi', lat: 28.6981, lng: 77.2044 },
];
