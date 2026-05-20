import axios from "axios";

export async function getNearbyJobs({
  lat,
  lng,
  radius,
}) {
  try {
    const response = await axios.get(
      "http://localhost:8000/api/v1/jobs/map",
      {
        params: {
          lat,
          lng,
          radius,
        },
      }
    );

    if (!response.data || !response.data.data || !Array.isArray(response.data.data.items)) {
      throw new Error("Invalid API response structure");
    }

    return response.data.data.items;
  } catch (error) {
    if (error.response?.status === 422) {
      const details = error.response.data?.detail || "Invalid parameters";
      throw new Error(Array.isArray(details) ? details[0]?.msg || "Invalid request" : String(details));
    }
    throw error;
  }
}