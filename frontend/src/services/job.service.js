import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export async function getNearbyJobs({ lat, lng, radius }) {
  try {
    const response = await axios.get("http://localhost:8000/api/v1/jobs/map", {
      params: {
        lat,
        lng,
        radius,
      },
    });

    if (
      !response.data ||
      !response.data.data ||
      !Array.isArray(response.data.data.items)
    ) {
      throw new Error("Invalid API response structure");
    }

    return response.data.data.items;
  } catch (error) {
    if (error.response?.status === 422) {
      const details = error.response.data?.detail || "Invalid parameters";
      throw new Error(
        Array.isArray(details)
          ? details[0]?.msg || "Invalid request"
          : String(details),
      );
    }
    throw error;
  }
}

export async function getRecommendedJobsSummary({ lat, lng, radius = 20 }) {
  try {
    const params = { radius };
    if (lat !== undefined && lat !== null) params.lat = lat;
    if (lng !== undefined && lng !== null) params.lng = lng;

    const response = await axios.get(
      `${API_BASE}/api/v1/users/recommended-jobs`,
      {
        params,
        withCredentials: true,
      },
    );

    if (!response.data || !response.data.data) {
      throw new Error("Invalid API response structure");
    }

    return response.data.data;
  } catch (error) {
    if (error.response?.status === 422) {
      const details = error.response.data?.detail || "Invalid parameters";
      throw new Error(
        Array.isArray(details)
          ? details[0]?.msg || "Invalid request"
          : String(details),
      );
    }
    throw error;
  }
}
