export function getDistanceFromOffice(lat1, lon1, officeLocation) {
    const { latitude: lat2, longitude: lon2 } = officeLocation;
  
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
    console.log('R:::::::',R);
    console.log('c:::::::::',c);
  
    return R * c; // in meters
  }
  
  /**
   * Check if current location is within office radius
   */
  export function isInOfficeRadius(lat, lon, officeLocation) {
    return getDistanceFromOffice(lat, lon, officeLocation) <= officeLocation.radiusMeters;
  }
