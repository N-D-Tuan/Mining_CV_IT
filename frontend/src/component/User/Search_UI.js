import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Bookmark } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";
const DEFAULT_LIMIT = 6;

const categoryOptions = [
  { id: "tech", label: "Tech & IT" },
  { id: "fb", label: "F&B - Nhà hàng" },
  { id: "marketing", label: "Marketing" },
  { id: "design", label: "Thiết kế" },
];

const workTypeOptions = [
  { id: "Remote", label: "Remote" },
  { id: "InOffice", label: "Văn phòng" },
  { id: "Hybrid", label: "Hybrid" },
];

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "salary_high", label: "Lương cao nhất" },
  { value: "salary_low", label: "Lương thấp nhất" },
];

export default function Search_UI() {
  const [jobs, setJobs] = useState([]);
  const [totaljobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [cityText, setCityText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedWorkType, setSelectedWorkType] = useState("");
  const [salaryMax, setSalaryMax] = useState(50);
  const [sortBy, setSortBy] = useState("newest");
  const [cursor, setCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [searchParams, setSearchParams] = useSearchParams();

  const queryTitle = searchParams.get("title") || "";
  const queryCity = searchParams.get("city") || "";
  const queryCategories = (searchParams.get("categories") || "").split("|").filter(Boolean);
  const queryWorkType = searchParams.get("job_type") || "";
  const querySalaryMax = searchParams.get("max_salary") ? Number(searchParams.get("max_salary")) / 1000000 : 50;
  const querySort = searchParams.get("sort") || "newest";

  useEffect(() => {
    setSearchText(queryTitle);
    setCityText(queryCity);
    setSelectedCategories(queryCategories);
    setSelectedWorkType(queryWorkType);
    setSalaryMax(querySalaryMax);
    setSortBy(querySort);
    setCursor(null);
    setNextCursor(null);
    fetchJobs({
      title: queryTitle,
      city: queryCity,
      categories: queryCategories,
      job_type: queryWorkType,
      max_salary: querySalaryMax * 1000000,
    });
  }, [searchParams.toString()]);

  const filterLabel = useMemo(() => {
    const active = [];
    if (searchText) active.push(`"${searchText}"`);
    if (cityText) active.push(cityText);
    if (selectedCategories.length) active.push(...selectedCategories);
    if (selectedWorkType) active.push(selectedWorkType);
    if (salaryMax < 50) active.push(`<= ${salaryMax}tr`);
    return active;
  }, [searchText, cityText, selectedCategories, selectedWorkType, salaryMax]);

  const sortedJobs = useMemo(() => {
    if (sortBy === "salary_high") {
      return [...jobs].sort((a, b) => (b.max_salary || 0) - (a.max_salary || 0));
    }
    if (sortBy === "salary_low") {
      return [...jobs].sort((a, b) => (a.min_salary || 0) - (b.min_salary || 0));
    }
    return jobs;
  }, [jobs, sortBy]);

  async function fetchJobs(options = {}) {
    const {
      loadMore = false,
      title = searchText,
      city = cityText,
      categories = selectedCategories,
      job_type = selectedWorkType,
      max_salary = salaryMax * 1000000,
    } = options;

    console.log(options, loadMore, nextCursor);

    if (loadMore && !nextCursor) {
      return;
    }

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("limit", DEFAULT_LIMIT);
    if (loadMore) {
      params.set("cursor", nextCursor);
    }

    const titleQuery = title || categories[0] || "";
    if (titleQuery) params.set("title", titleQuery);
    if (city) params.set("city", city);
    if (job_type) params.set("job_type", job_type);
    if (max_salary < 50 * 1000000) params.set("max_salary", max_salary);

    try {
      const res = await fetch(`${API_BASE}/api/v1/jobs?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.message || "Không tải được dữ liệu");
        return;
      }

      const items = data.data?.items || [];
      setJobs((prev) => (loadMore ? [...prev, ...items] : items));
      setTotalJobs(data.data?.total || 0);
      setNextCursor(data.data?.next_cursor || null);
      setHasNext(!!data.data?.has_next);
    } catch (err) {
      setError("Không tải được việc làm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSavedJobs() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/users/saved-jobs?limit=100`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return;
      const ids = (data.data?.items || []).map((job) => job.id);
      setSavedJobIds(new Set(ids));
    } catch (err) {
      // ignore saved job loading failures
    }
  }

  function handleCategoryChange(option) {
    if (selectedCategories.includes(option.label)) {
      setSelectedCategories((prev) => prev.filter((item) => item !== option.label));
      return;
    }
    setSelectedCategories((prev) => [...prev, option.label]);
  }

  function handleSearch(event) {
    event?.preventDefault();
    setCursor(null);
    setNextCursor(null);

    const params = new URLSearchParams();
    if (searchText) params.set("title", searchText);
    if (cityText) params.set("city", cityText);
    if (selectedCategories.length) params.set("categories", selectedCategories.join("|"));
    if (selectedWorkType) params.set("job_type", selectedWorkType);
    if (salaryMax < 50) params.set("max_salary", String(salaryMax * 1000000));
    if (sortBy && sortBy !== "newest") params.set("sort", sortBy);

    setSearchParams(params, { replace: true });
  }

  function handleClearFilters() {
    setSearchText("");
    setCityText("");
    setSelectedCategories([]);
    setSelectedWorkType("");
    setSalaryMax(50);
    setSortBy("newest");
    setCursor(null);
    setNextCursor(null);
    setSearchParams({}, { replace: true });
  }

  function formatSalary(job) {
    if (job.min_salary != null && job.max_salary != null) {
      return `${job.min_salary.toLocaleString("vi-VN")}đ - ${job.max_salary.toLocaleString("vi-VN")}đ`;
    }
    if (job.min_salary != null) {
      return `${job.min_salary.toLocaleString("vi-VN")}đ`;
    }
    if (job.max_salary != null) {
      return `${job.max_salary.toLocaleString("vi-VN")}đ`;
    }
    return "Thương lượng";
  }

  function formatLocation(job) {
    return job.city || job.address || "Không rõ địa điểm";
  }

  function formatType(job) {
    return job.job_type || "Part-time";
  }

  function formatSource(job) {
    return job.employer_name || job.source || "Nhà tuyển dụng";
  }

  function formatPostedTime(job) {
    if (!job.created_at) return "Mới đăng";
    const date = new Date(job.created_at);
    return date.toLocaleDateString("vi-VN");
  }

  return (
    <main className="max-w-container-max mx-auto px-gutter py-xl">
      <div className="flex flex-col lg:flex-row gap-xl">
        <aside className="hidden lg:flex flex-col gap-md w-72 self-start sticky top-24 z-10">
          <div className="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
            <div className="flex items-center justify-between mb-lg">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">filter_list</span>
                <h2 className="font-headline-sm text-headline-sm">Bộ lọc</h2>
              </div>
            </div>

            <div className="mb-lg">
              <div className="flex items-center justify-between mb-sm cursor-pointer group">
                <span className="font-label-md text-label-md uppercase text-outline">Địa điểm</span>
                <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
              </div>
              <div className="relative">
                <input
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-md py-sm text-body-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="Tìm thành phố..."
                  type="text"
                  value={cityText}
                  onChange={(e) => setCityText(e.target.value)}
                />
                <span className="material-symbols-outlined absolute right-3 top-2 text-outline text-lg">search</span>
              </div>
            </div>

            <div className="mb-lg">
              <div className="flex items-center justify-between mb-sm">
                <span className="font-label-md text-label-md uppercase text-outline">Mức lương</span>
              </div>
              <div className="px-xs py-md">
                <input
                  className="w-full h-2 bg-secondary-container rounded-lg appearance-none cursor-pointer accent-primary"
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(Number(e.target.value))}
                />
                <div className="flex justify-between mt-sm text-body-sm text-on-surface-variant font-medium">
                  <span>0</span>
                  <span>{salaryMax}tr+</span>
                </div>
              </div>
            </div>

            <div className="mb-lg">
              <div className="flex items-center justify-between mb-sm">
                <span className="font-label-md text-label-md uppercase text-outline">Danh mục</span>
              </div>
              <div className="flex flex-col gap-sm">
                {categoryOptions.map((option) => (
                  <label key={option.id} className="flex items-center gap-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(option.label)}
                      onChange={() => handleCategoryChange(option)}
                      className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span className="text-body-sm group-hover:text-primary transition-colors">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-lg">
              <div className="flex items-center justify-between mb-sm">
                <span className="font-label-md text-label-md uppercase text-outline">Hình thức</span>
              </div>
              <div className="flex flex-wrap gap-xs">
                {workTypeOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedWorkType(option.label)}
                    className={`px-md py-xs rounded-full border text-label-sm transition-all ${
                      selectedWorkType === option.label
                        ? "border-primary bg-primary-container text-on-primary-container font-bold"
                        : "border-outline-variant bg-surface text-on-surface hover:border-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full mt-md py-md rounded-xl border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high hover:text-error transition-all flex items-center justify-center gap-sm"
            >
              <span className="material-symbols-outlined text-md">close</span>
              Xóa bộ lọc
            </button>
          </div>

          <div className="bg-primary-container rounded-xl p-md text-on-primary-container">
            <h3 className="font-headline-sm text-headline-sm mb-xs">Mở rộng cơ hội?</h3>
            <p className="text-body-sm opacity-90 mb-md">Tham gia các khóa học ngắn hạn để tăng tỷ lệ được tuyển dụng.</p>
            <button className="w-full py-sm bg-white text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all text-label-md">
              Xem khóa học
            </button>
          </div>
        </aside>

        <section className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl">
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface">
                Tìm thấy <span className="text-primary">{totaljobs}</span> công việc
              </h1>
              <p className="text-body-sm text-on-surface-variant">Việc làm mới nhất được cập nhật mỗi 3 phút</p>
            </div>
            <div className="flex items-center gap-sm">
              <span className="text-body-sm text-on-surface-variant font-medium">Sắp xếp:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const nextSort = e.target.value;
                    setSortBy(nextSort);
                    const params = new URLSearchParams(searchParams);
                    if (nextSort && nextSort !== "newest") {
                      params.set("sort", nextSort);
                    } else {
                      params.delete("sort");
                    }
                    setSearchParams(params, { replace: true });
                  }}
                  className="appearance-none bg-surface-container-low border border-outline-variant rounded-lg pl-md pr-10 py-sm text-body-sm font-medium focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-xl">
            <form onSubmit={handleSearch} className="grid gap-md lg:grid-cols-[1.8fr_1fr_1fr_auto] items-end">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Tìm kiếm</label>
                <input
                  type="text"
                  placeholder="Vị trí, kỹ năng hoặc công ty"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-md py-sm text-body-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Thành phố</label>
                <input
                  type="text"
                  placeholder="HCM, Hà Nội,..."
                  value={cityText}
                  onChange={(e) => setCityText(e.target.value)}
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-md py-sm text-body-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Mức lương tối đa</label>
                <div className="w-full flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(Number(e.target.value))}
                    className="w-full h-2 bg-secondary-container rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-body-sm font-bold text-on-surface">{salaryMax}tr</span>
                </div>
              </div>

              <button
                type="submit"
                className="bg-primary text-on-primary font-bold rounded-xl px-2xl py-md hover:bg-primary-container transition-all"
              >
                Tìm kiếm
              </button>
            </form>
          </div>

          <div className="flex flex-wrap gap-2 mb-lg">
            {filterLabel.map((item) => (
              <span key={item} className="bg-surface-container-high px-md py-2 rounded-full text-body-sm text-on-surface-variant">
                {item}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-lg">
            {loading && !jobs.length ? (
              <div className="col-span-1 md:col-span-2 xl:col-span-3 p-lg rounded-xl bg-surface-container-lowest border border-outline-variant text-center text-on-surface-variant">
                Đang tải danh sách việc làm...
              </div>
            ) : error ? (
              <div className="col-span-1 md:col-span-2 xl:col-span-3 p-lg rounded-xl bg-surface-container-lowest border border-red-200 text-red-700 text-center">
                {error}
              </div>
            ) : jobs.length === 0 ? (
              <div className="col-span-1 md:col-span-2 xl:col-span-3 p-lg rounded-xl bg-surface-container-lowest border border-outline-variant text-center text-on-surface-variant">
                Không có việc làm phù hợp.
              </div>
            ) : (
              sortedJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="bg-surface-container-lowest p-md rounded-xl job-card-shadow job-card-hover transition-all duration-200 border border-outline-variant flex flex-col h-full group no-underline"
                >
                  <div className="flex justify-between items-start mb-md">
                    <div className="flex items-center gap-sm">
                      <div>
                        <h3 className="font-headline-sm text-headline-sm mb-xs group-hover:text-primary transition-colors job-card-title-clamp-2">
                          {job.title || "Không rõ tên vị trí"}
                        </h3>
                        <p className="text-on-surface-variant text-body-sm job-card-meta-clamp-2">
                          {formatSource(job)} • {formatLocation(job)}
                        </p>
                      </div>
                    </div>
                    <Bookmark
                      className={`w-5 h-5 transition-colors ${savedJobIds.has(job.id) ? 'text-primary' : 'text-on-surface-variant'}`}
                      fill={savedJobIds.has(job.id) ? 'currentColor' : 'none'}
                    />
                  </div>

                  <div className="mt-auto">
                    <div className="text-primary font-bold text-headline-sm mb-sm">{formatSalary(job)}</div>
                    <div className="flex justify-between items-center text-on-surface-variant text-body-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {formatPostedTime(job)}
                      </span>
                      <span className="bg-secondary-container px-sm py-[2px] rounded text-on-secondary-container text-label-sm">
                        {formatType(job)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {hasNext && (
            <div className="mt-xl text-center">
                <button
                type="button"
                onClick={() => fetchJobs({ loadMore: true })}
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container transition-all disabled:opacity-60"
                >
                {loading ? "Đang tải thêm..." : "Xem thêm"}
                </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
