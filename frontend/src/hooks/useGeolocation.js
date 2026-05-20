import { useEffect, useState } from "react";

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Kiểm tra cache trước
    const cached = localStorage.getItem("user_location");

    if (cached) {
      setLocation(JSON.parse(cached));
      setLoading(false);
      return;
    }

    // 2. Browser không hỗ trợ
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    // 3. Xin quyền vị trí
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // lưu cache
        localStorage.setItem("user_location", JSON.stringify(coords));

        setLocation(coords);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Location permission denied");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
      },
    );
  }, []);

  return {
    location,
    loading,
    error,
  };
}
