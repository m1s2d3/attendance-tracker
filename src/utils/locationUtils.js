// src/utils/locationUtils.js

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function getDistanceFromOffice(lat1, lon1) {
    const { latitude: lat2, longitude: lon2 } = OFFICE_LOCATION;
  
    const R = 6371e3; // Earth’s radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // in meters
  }
  
  /**
   * Check if current location is within office radius
   */
  export function isInOfficeRadius(lat, lon) {
    alert("Distance from office:", getDistanceFromOffice(lat, lon));
    return getDistanceFromOffice(lat, lon) <= OFFICE_LOCATION.radiusMeters;
  }
