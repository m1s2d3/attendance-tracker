import { useEffect, useRef } from 'react';
import { isInOfficeRadius } from '../utils/locationUtils';

const useGeolocationTracking = ({ isAutoAttendanceEnabled, handleCheckIn, handleCheckOut, officeLocation }) => {
  const lastCheckInDateRef = useRef(null);
  const isInsideRef = useRef(false); // Track whether user is currently inside radius

  useEffect(() => {
    if (!isAutoAttendanceEnabled) return;

    let watchId;

    const successCallback = (position) => {
      const { latitude, longitude } = position.coords;
      const isInRadius = isInOfficeRadius(latitude, longitude, officeLocation);
      const today = new Date().toDateString();

      if (isInRadius) {
        // Check-in only if not already done today
        if (lastCheckInDateRef.current !== today) {
          handleCheckIn();
          lastCheckInDateRef.current = today;
        }
        isInsideRef.current = true;
      } else {
        // Check-out when user goes out
        if (isInsideRef.current) {
          handleCheckOut();
          isInsideRef.current = false;
        }
      }
    };

    const errorCallback = (error) => {
      console.error('Geolocation error:', error.message);
    };

    watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isAutoAttendanceEnabled, handleCheckIn, handleCheckOut, officeLocation]);
};

export default useGeolocationTracking;
