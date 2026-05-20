import { useEffect, useState } from "react";

export function useGeolocation() {
  const [location, setLocation] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  console.log(location);
  

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        setLoading(false);
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
      }
    );
  }, []);

  return {
    location,
    loading,
    error,
  };
}