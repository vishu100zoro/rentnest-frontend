import { calculateHaversineDistance } from './distance.js';

const DEFAULT_REFERENCE_POINT = { lat: 22.5726, lng: 88.3639 }; // Kolkata city center fallback

/**
 * Enrich properties with calculated distance from userLocation (or city center reference)
 * and return filtered & sorted array.
 */
export function filterAndSortProperties(properties, searchState) {
  const { query, filters, sortBy, userLocation } = searchState;
  const refPoint = userLocation || DEFAULT_REFERENCE_POINT;

  const enriched = properties.map((prop) => {
    const distanceKm = calculateHaversineDistance(
      refPoint.lat,
      refPoint.lng,
      prop.latitude,
      prop.longitude
    );
    return {
      ...prop,
      distanceKm,
    };
  });

  const locationTerm = (query.location || '').trim().toLowerCase();

  const filtered = enriched.filter((prop) => {
    // Text search across city, locality, address, and property name
    if (locationTerm) {
      const haystack = `${prop.name} ${prop.city} ${prop.locality} ${prop.address}`.toLowerCase();
      const tokens = locationTerm.split(/[,\s]+/).filter(Boolean);
      const matchesAll = tokens.every((t) => haystack.includes(t));
      if (!matchesAll) return false;
    }

    // Rent range
    if (prop.monthlyRent < filters.minRent || prop.monthlyRent > filters.maxRent) {
      return false;
    }

    // Property type (combine hero selector & sidebar multi-select)
    const activeTypes =
      filters.propertyTypes.length > 0
        ? filters.propertyTypes
        : query.propertyType && query.propertyType !== 'All'
        ? [query.propertyType]
        : [];

    if (activeTypes.length > 0) {
      const matchesType = activeTypes.some((type) => {
        if (type === '1 BHK / 2 BHK Flats') {
          return prop.propertyType === '1 BHK' || prop.propertyType === '2 BHK';
        }
        return prop.propertyType.toLowerCase() === type.toLowerCase();
      });
      if (!matchesType) return false;
    }

    // Gender preference
    if (filters.genderPreference && filters.genderPreference !== 'All') {
      if (prop.genderPreference.toLowerCase() !== filters.genderPreference.toLowerCase()) {
        return false;
      }
    }

    // Room sharing
    if (filters.roomSharing.length > 0) {
      const hasMatchingRoom = prop.roomTypes.some((room) =>
        filters.roomSharing.some((selected) =>
          room.type.toLowerCase().includes(selected.toLowerCase())
        )
      );
      if (!hasMatchingRoom) return false;
    }

    // Furnishing
    if (filters.furnishing && filters.furnishing !== 'All') {
      if (prop.furnishing.toLowerCase() !== filters.furnishing.toLowerCase()) {
        return false;
      }
    }

    // AC / Non-AC
    if (filters.acPreference === 'AC') {
      const hasAc = prop.amenities.includes('ac') || prop.roomTypes.some((r) => r.ac);
      if (!hasAc) return false;
    } else if (filters.acPreference === 'Non-AC') {
      const hasNonAc = prop.roomTypes.some((r) => !r.ac);
      if (!hasNonAc) return false;
    }

    // Boolean toggles
    if (filters.attachedBathroom) {
      const hasBath =
        prop.amenities.includes('attached_bathroom') ||
        prop.roomTypes.some((r) => r.attachedBathroom);
      if (!hasBath) return false;
    }

    if (filters.foodIncluded && !prop.foodIncluded) return false;
    if (filters.availableOnly && prop.availableRoomsCount <= 0) return false;

    // Amenity checkboxes
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every((am) => prop.amenities.includes(am));
      if (!hasAllAmenities) return false;
    }

    // Distance filter (meaningful when Near Me / city reference is active)
    if (filters.maxDistanceKm && filters.maxDistanceKm < 50 && prop.distanceKm !== null) {
      if (prop.distanceKm > filters.maxDistanceKm) return false;
    }

    // Minimum rating
    if (filters.minRating > 0 && prop.rating < filters.minRating) {
      return false;
    }

    return true;
  });

  // Sort results
  const sorted = [...filtered];
  switch (sortBy) {
    case 'price_asc':
      sorted.sort((a, b) => a.monthlyRent - b.monthlyRent);
      break;
    case 'price_desc':
      sorted.sort((a, b) => b.monthlyRent - a.monthlyRent);
      break;
    case 'rating_desc':
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case 'popular':
      sorted.sort((a, b) => b.popularityScore - a.popularityScore);
      break;
    case 'nearest':
      sorted.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      break;
    case 'recommended':
    default:
      sorted.sort((a, b) => {
        const recDiff = Number(b.recommended) - Number(a.recommended);
        if (recDiff !== 0) return recDiff;
        return b.popularityScore - a.popularityScore;
      });
      break;
  }

  return sorted;
}
