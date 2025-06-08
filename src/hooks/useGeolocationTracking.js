import { useEffect, useRef } from 'react';
import { isInOfficeRadius } from '../utils/locationUtils';

const useGeolocationTracking = ({ isAutoAttendanceEnabled, handleAutoCheckIn, handleAutoCheckOut,officeLocation }) => {
  const lastCheckInRef = useRef(null);
  const lastCheckOutRef = useRef(null);

  useEffect(() => {
    if (!isAutoAttendanceEnabled) return;

    let watchId;

    const successCallback = (position) => {
      const { latitude, longitude } = position.coords;

      if (isInOfficeRadius(latitude, longitude,officeLocation)) {
        const today = new Date().toDateString();

        if (!lastCheckInRef.current || lastCheckInRef.current !== today) {
          handleAutoCheckIn(); //Auto check-in
          lastCheckInRef.current = today;
        }
      } else {
        const today = new Date().toDateString();
        if (!lastCheckOutRef.current || lastCheckOutRef.current !== today) {
          handleAutoCheckOut(); // Auto check-out
          lastCheckOutRef.current = today;
        }
      }
    };

    const errorCallback = (error) => {
      console.error("Geolocation error:", error.message);
    };

    // Start watching location
    watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isAutoAttendanceEnabled, handleAutoCheckIn, handleAutoCheckOut, officeLocation]);
}; 

export default useGeolocationTracking;
