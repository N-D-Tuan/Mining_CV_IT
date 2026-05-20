import { useEffect, useState } from "react";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";

import { useGeolocation } from "../hooks/useGeolocation";

import { getNearbyJobs } from "../services/job.service";
import { Link } from "react-router-dom";

export default function JobsMapPage() {
  const { location, loading, error } = useGeolocation();
  console.log("[location]", location);

  const [radius, setRadius] = useState(5);
  const [jobs, setJobs] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [jobError, setJobError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (!location) return;
    fetchJobs();
  }, [location, radius]);

  async function fetchJobs() {
    try {
      setFetching(true);
      setJobError(null);

      const data = await getNearbyJobs({
        lat: location.lat,
        lng: location.lng,
        radius,
      });

      const validJobs = Array.isArray(data)
        ? data.filter((job) => job && typeof job === "object" && "id" in job)
        : [];
      setJobs(validJobs);
    } catch (err) {
      console.error(err);
      setJobError(err.message || "Không thể tải danh sách công việc");
      setJobs([]);
    } finally {
      setFetching(false);
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">
            Đang xác định vị trí của bạn...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-gray-800 font-semibold text-lg mb-2">
            Không thể xác định vị trí
          </p>
          <p className="text-gray-600 text-sm">
            {error?.msg || error?.message || String(error)}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 relative z-10 overflow-hidden">
      {/* Header */}
      <header className="relative z-20 bg-white border-b border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bản đồ công việc
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Tìm công việc gần vị trí của bạn
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                📍 Bán kính: {radius} km
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Sidebar - Controls */}
        <aside className="w-80 bg-white rounded-xl shadow-md border border-gray-200 overflow-y-auto flex flex-col">
          {/* Filter Section */}
          <div className="p-4 border-b border-gray-200">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              🔍 Bán kính tìm kiếm
            </label>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value={1}>1 km</option>
              <option value={3}>3 km</option>
              <option value={5}>5 km (Mặc định)</option>
              <option value={10}>10 km</option>
              <option value={10}>30 km</option>
              <option value={10}>50 km</option>
            </select>
          </div>

          {/* Stats Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Công việc tìm thấy</span>
              <span className="text-2xl font-bold text-blue-600">
                {jobs.length}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {jobError && (
            <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">❌ {jobError}</p>
            </div>
          )}

          {/* Loading State */}
          {fetching && (
            <div className="m-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <p className="text-sm text-blue-700 font-medium">
                Đang tải công việc...
              </p>
            </div>
          )}

          {/* Jobs List */}
          <div className="flex-1 overflow-y-auto">
            {jobs.length > 0 ? (
              <div className="p-4 space-y-3">
                {jobs.map((job) => (
                  <Link
                    to={`/jobs/${job.id}`}
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`block p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedJob?.id === job.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                      {job.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.employer_name}
                    </p>
                    <p className="text-sm font-bold text-blue-600 mt-2">
                      {job.raw_salary || "Thương lượng"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      📍 {job.address}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              !fetching &&
              !jobError && (
                <div className="flex items-center justify-center h-full text-center p-4">
                  <div>
                    <p className="text-gray-500 text-sm">
                      Không có công việc trong bán kính này
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      Hãy thử tăng bán kính tìm kiếm
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </aside>

        {/* Map Container */}
        <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {location && (
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={14}
              className="h-full w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User Location Marker */}
              <Marker position={[location.lat, location.lng]}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">
                      Vị trí của bạn
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Search Radius Circle */}
              <Circle
                center={[location.lat, location.lng]}
                radius={radius * 1000}
                pathOptions={{
                  color: "#3b82f6",
                  weight: 2,
                  opacity: 0.3,
                  fillOpacity: 0.1,
                }}
              />

              {/* Job Markers */}
              {jobs.map((job) => {
                if (job.lat == null || job.lng == null) return null;

                const isSelected = selectedJob?.id === job.id;

                return (
                  <Marker
                    key={job.id}
                    position={[job.lat, job.lng]}
                    eventHandlers={{
                      click: () => setSelectedJob(job),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[280px]">
                        <h3 className="font-semibold text-base text-gray-900">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {job.employer_name}
                        </p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          {job.raw_salary || "Thương lượng"}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          📍 {job.address}
                        </p>
                        {job.job_type && (
                          <p className="text-xs text-gray-500 mt-2 bg-gray-100 inline-block px-2 py-1 rounded">
                            {job.job_type}
                          </p>
                        )}
                        <Link to={`/jobs/${job.id}`}>
                          <button className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium transition-colors">
                            Xem chi tiết
                          </button>
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
