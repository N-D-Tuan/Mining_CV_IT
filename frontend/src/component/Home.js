import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGeolocation } from "../hooks/useGeolocation";
import { getRecommendedJobsSummary } from "../services/job.service";
import { X } from "lucide-react";
import { BriefcaseBusiness, MapPin, Sparkles, ArrowRight } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function Home() {
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  const [appliedCount, setAppliedCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [recommendedStats, setRecommendedStats] = useState(null);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [recommendedError, setRecommendedError] = useState(null);
  const [recommendedPopupOpen, setRecommendedPopupOpen] = useState(false);

  const { location, loading, error } = useGeolocation();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentActivities") || "[]");
    setRecentActivities(stored.slice(0, 3));

    fetch(`${API_BASE}/api/v1/users/applied-jobs`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setAppliedCount(data.data.total || data.data.items?.length || 0);
        }
      })
      .catch((err) => console.log("Lỗi tải ứng tuyển:", err));

    fetch(`${API_BASE}/api/v1/users/saved-jobs`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setSavedCount(data.data.total || data.data.items?.length || 0);
        }
      })
      .catch((err) => console.log("Lỗi tải đã lưu:", err));
  }, []);

  useEffect(() => {
    let active = true;

    const fetchRecommended = async () => {
      setRecommendedLoading(true);
      setRecommendedError(null);

      try {
        const stats = await getRecommendedJobsSummary({
          lat: location?.lat,
          lng: location?.lng,
          radius: 20,
        });
        if (!active) return;
        setRecommendedStats(stats);
      } catch (err) {
        if (!active) return;
        setRecommendedError(err.message || "Không thể tải gợi ý việc làm");
      } finally {
        if (!active) return;
        setRecommendedLoading(false);
      }
    };

    if (!loading) {
      fetchRecommended();
    }

    return () => {
      active = false;
    };
  }, [location, loading]);

  // Hàm chọn màu và icon tùy theo loại hoạt động
  const getActivityStyle = (type) => {
    switch (type) {
      case "apply":
        return { icon: "send", bg: "bg-primary text-on-primary" };
      case "save":
        return { icon: "bookmark", bg: "bg-secondary text-on-secondary" };
      case "unsave":
        return { icon: "bookmark_remove", bg: "bg-error text-on-error" };
      case "search":
        return { icon: "search", bg: "bg-tertiary text-on-tertiary" };
      case "view":
        return { icon: "visibility", bg: "bg-outline-variant text-on-surface" };
      default:
        return {
          icon: "history",
          bg: "bg-surface-container-high text-on-surface",
        };
    }
  };

  // Hàm format thời gian đẹp
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSalary = (job) => {
    if (job.raw_salary) return job.raw_salary;
    if (job.min_salary != null && job.max_salary != null) {
      return `${job.min_salary.toLocaleString("vi-VN")} - ${job.max_salary.toLocaleString("vi-VN")} ${job.salary_type || "VNĐ"}`;
    }
    if (job.min_salary != null)
      return `${job.min_salary.toLocaleString("vi-VN")} ${job.salary_type || "VNĐ"}`;
    if (job.max_salary != null)
      return `${job.max_salary.toLocaleString("vi-VN")} ${job.salary_type || "VNĐ"}`;
    return "Thoả thuận";
  };

  const renderJobItem = (job) => (
    <Link
      key={job.id}
      to={`/jobs/${job.id}`}
      className="
      group block overflow-hidden
      rounded-2xl border border-slate-800
      bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950
      p-5
      shadow-md shadow-black/20
      transition-all duration-300
      hover:-translate-y-1
      hover:border-blue-500
      hover:shadow-blue-500/20
    "
    >
      {/* Header */}
      <div className="flex flex-col gap-4">
        {/* Title + Company */}
        <div className="min-w-0">
          <h3
            className="
            text-lg font-semibold text-white
            line-clamp-2
            leading-snug
            group-hover:text-blue-400
            transition-colors
          "
          >
            {job.title || "Không có tiêu đề"}
          </h3>

          <p className="mt-2 text-sm text-slate-400 line-clamp-1">
            {job.employer_name || "Nhà tuyển dụng chưa rõ"}
          </p>
        </div>

        {/* Salary riêng 1 hàng */}
        <div
          className="
          w-full rounded-xl
          bg-blue-500/15
          border border-blue-500/30
          px-4 py-3
          text-blue-400
          backdrop-blur-sm
        "
        >
          <p className="text-xs uppercase tracking-wide text-blue-300/70 mb-1">
            Mức lương
          </p>

          <p
            className="
            text-sm font-semibold
            leading-5
            line-clamp-2
            break-words
          "
          >
            {formatSalary(job)}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {/* Location */}
        <div
          className="
          flex items-center gap-1
          rounded-full
          bg-white/5
          px-3 py-1.5
          text-slate-300
          max-w-full
        "
        >
          <span>📍</span>

          <span className="line-clamp-1">
            {job.city || job.address || "Địa điểm chưa rõ"}
          </span>
        </div>

        {/* Job Type */}
        {job.job_type ? (
          <div
            className="
            rounded-full
            bg-blue-500
            px-3 py-1.5
            text-xs font-medium text-white
            shadow-sm shadow-blue-500/30
          "
          >
            {job.job_type}
          </div>
        ) : null}
      </div>
    </Link>
  );

  return (
    <>
      <div className="p-gutter max-w-container-max mx-auto space-y-xl">
        {/* <!-- Statistic Cards Grid --> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {/* <!-- Stat Card 1 --> */}
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-md">
              <div className="p-sm bg-primary-fixed rounded-lg text-primary">
                <span className="material-symbols-outlined">send</span>
              </div>
              <span className="text-green-600 font-label-sm flex items-center gap-xs">
                +12%{" "}
                <span className="material-symbols-outlined text-[14px]">
                  trending_up
                </span>
              </span>
            </div>
            <h3 className="font-body-sm text-on-surface-variant">
              Tổng công việc đã ứng tuyển
            </h3>
            <p className="font-display text-headline-md mt-xs">
              {appliedCount}
            </p>
          </div>
          {/* <!-- Stat Card 2 --> */}
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-md">
              <div className="p-sm bg-secondary-fixed rounded-lg text-secondary">
                <span className="material-symbols-outlined">bookmark</span>
              </div>
              <span className="text-on-surface-variant font-label-sm">
                Ổn định
              </span>
            </div>
            <h3 className="font-body-sm text-on-surface-variant">
              Công việc đã lưu
            </h3>
            <p className="font-display text-headline-md mt-xs">{savedCount}</p>
          </div>
          {/* <!-- Stat Card 3 --> */}
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-md">
              <div className="p-sm bg-tertiary-fixed rounded-lg text-tertiary">
                <span className="material-symbols-outlined">visibility</span>
              </div>
              <span className="text-green-600 font-label-sm flex items-center gap-xs">
                +5%{" "}
                <span className="material-symbols-outlined text-[14px]">
                  trending_up
                </span>
              </span>
            </div>
            <h3 className="font-body-sm text-on-surface-variant">
              Lượt xem hồ sơ
            </h3>
            <p className="font-display text-headline-md mt-xs">342</p>
          </div>
          {/* <!-- Stat Card 4 --> */}
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-md">
              <div className="p-sm bg-error-container rounded-lg text-on-error-container">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <span className="text-primary font-label-sm">Rất tốt</span>
            </div>
            <h3 className="font-body-sm text-on-surface-variant">
              Tỷ lệ phản hồi
            </h3>
            <p className="font-display text-headline-md mt-xs">88%</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant">
          <div className="flex items-center justify-between gap-4 mb-md">
            <div>
              <h2 className="font-headline-sm">Việc làm phù hợp với bạn</h2>
            </div>
            <span className="text-primary font-bold text-label-lg">
              Dựa vào hồ sơ
            </span>
          </div>

          {recommendedLoading ? (
            <p className="text-body-md text-on-surface-variant">
              Đang tải gợi ý việc làm...
            </p>
          ) : recommendedError ? (
            <p className="text-body-md text-error">{recommendedError}</p>
          ) : (
            <>
              {/* WRAPPER */}
              <div
                className="
      relative overflow-hidden
      rounded-3xl
      border border-slate-200
      bg-gradient-to-br from-white via-slate-50 to-blue-50
      p-6 md:p-8
      shadow-xl shadow-slate-200/60
    "
              >
                {/* Glow Effect */}
                <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-200/30 blur-3xl" />
                <div className="absolute -bottom-24 -left-20 h-52 w-52 rounded-full bg-cyan-200/30 blur-3xl" />

                {/* HEADER */}
                <div className="relative z-10 mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div
                      className="
            mb-3 inline-flex items-center gap-2
            rounded-full
            border border-blue-200
            bg-blue-100
            px-4 py-2
            text-sm font-medium text-blue-700
          "
                    >
                      <Sparkles size={16} />
                      Job Recommendation
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900">
                      Công việc dành riêng cho bạn
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      Hệ thống phân tích hồ sơ, kỹ năng và vị trí của bạn để đề
                      xuất những công việc phù hợp nhất.
                    </p>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => setRecommendedPopupOpen(true)}
                    className="
          group inline-flex items-center justify-center gap-2
          rounded-2xl
          bg-blue-600
          px-5 py-3
          text-sm font-semibold text-white
          shadow-lg shadow-blue-500/20
          transition-all duration-300
          hover:-translate-y-0.5
          hover:bg-blue-500
        "
                  >
                    Xem matching jobs
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </div>

                {/* STATS */}
                <div className="relative z-10 grid grid-cols-1 gap-5 md:grid-cols-3">
                  {/* MATCHING JOBS */}
                  <div
                    className="
          group rounded-2xl
          border border-slate-200
          bg-white/80
          p-5
          backdrop-blur-md
          transition-all duration-300
          hover:-translate-y-1
          hover:border-blue-300
          hover:shadow-lg hover:shadow-blue-100
        "
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-500">
                          Công việc phù hợp
                        </p>

                        <h3 className="mt-3 text-4xl font-bold text-slate-900">
                          {recommendedStats?.total_matching_jobs ?? 0}
                        </h3>
                      </div>

                      <div
                        className="
              flex h-12 w-12 items-center justify-center
              rounded-xl
              bg-blue-100
              text-blue-600
            "
                      >
                        <BriefcaseBusiness size={24} />
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      Được đề xuất dựa trên hồ sơ và kỹ năng của bạn
                    </p>
                  </div>

                  {/* NEARBY JOBS */}
                  <div
                    className="
          group rounded-2xl
          border border-slate-200
          bg-white/80
          p-5
          backdrop-blur-md
          transition-all duration-300
          hover:-translate-y-1
          hover:border-cyan-300
          hover:shadow-lg hover:shadow-cyan-100
        "
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-500">
                          Công việc gần bạn
                        </p>

                        <h3 className="mt-3 text-4xl font-bold text-slate-900">
                          {recommendedStats?.nearby_matching_jobs ?? 0}
                        </h3>
                      </div>

                      <div
                        className="
              flex h-12 w-12 items-center justify-center
              rounded-xl
              bg-cyan-100
              text-cyan-600
            "
                      >
                        <MapPin size={24} />
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      Trong bán kính {recommendedStats?.radius ?? 20} km
                    </p>
                  </div>

                  {/* AI INFO */}
                  <div
                    className="
          rounded-2xl
          border border-blue-100
          bg-gradient-to-br from-blue-50 to-cyan-50
          p-5
        "
                  >
                    <div
                      className="
            mb-4 flex h-12 w-12 items-center justify-center
            rounded-xl
            bg-white
            text-blue-600
            shadow-sm
          "
                    >
                      <Sparkles size={24} />
                    </div>

                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      <li>• Thành phố & vị trí hiện tại</li>
                      <li>• Công việc yêu thích</li>
                      <li>• Kỹ năng & kinh nghiệm</li>
                      <li>• Mức độ phù hợp với tuyển dụng</li>
                    </ul>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="relative z-10 mt-6 border-t border-slate-200 pt-5">
                  <p className="text-sm text-slate-500">
                    Hiển thị top 20 công việc phù hợp nhất và top 20 công việc
                    gần vị trí của bạn.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {recommendedPopupOpen ? (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setRecommendedPopupOpen(false)}
            />

            {/* Modal */}
            <div className="relative flex h-full items-center justify-center p-4">
              <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] bg-surface shadow-2xl">
                {/* CLOSE BUTTON */}
                <button
                  onClick={() => setRecommendedPopupOpen(false)}
                  className="
              absolute right-5 top-5 z-20
              flex h-11 w-11 items-center justify-center
              rounded-full
              bg-surface-container
              text-on-surface-variant
              transition-all duration-200
              hover:scale-105
              hover:bg-red-500
              hover:text-white
            "
                >
                  <X size={22} />
                </button>
                <div className="max-h-[75vh] overflow-hidden px-8 py-6">
                  {/* Tabs */}
                  <div className="mb-6 flex w-fit items-center gap-3 rounded-2xl bg-surface-container p-2">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`rounded-xl px-5 py-3 transition-all ${
                        activeTab === "profile"
                          ? "bg-primary text-on-primary"
                          : "hover:bg-surface-container-high"
                      }`}
                    >
                      Jobs phù hợp profile
                    </button>

                    <button
                      onClick={() => setActiveTab("nearby")}
                      className={`rounded-xl px-5 py-3 transition-all ${
                        activeTab === "nearby"
                          ? "bg-secondary text-on-secondary"
                          : "hover:bg-surface-container-high"
                      }`}
                    >
                      Jobs gần bạn
                    </button>
                  </div>

                  {/* CONTENT */}
                  <div className="max-h-[58vh] overflow-y-auto">
                    {/* PROFILE */}
                    {activeTab === "profile" && (
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {recommendedStats?.profile_jobs?.map(renderJobItem)}
                      </div>
                    )}

                    {/* NEARBY */}
                    {activeTab === "nearby" && (
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {recommendedStats?.nearby_jobs?.map(renderJobItem)}
                      </div>
                    )}
                  </div>
                </div>
                {/* FOOTER */}
                ...
              </div>
            </div>
          </div>
        ) : null}
        {/* <!-- Bento Grid Content --> */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* <!-- Chart Section (Bar Chart Simulation) --> */}
          <div className="lg:col-span-8 bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
            <div className="flex justify-between items-center mb-xl">
              <h2 className="font-headline-sm">
                Hoạt động tìm việc trong 30 ngày qua
              </h2>
              <div className="flex gap-sm">
                <button className="px-md py-xs rounded-full border border-outline-variant font-label-sm hover:bg-surface-container-low">
                  Tháng này
                </button>
                <button className="px-md py-xs rounded-full bg-primary-container text-on-primary-container font-label-sm">
                  30 ngày qua
                </button>
              </div>
            </div>
            {/* <!-- Bar Chart Viz --> */}
            <div className="flex items-end justify-between h-48 gap-xs">
              <div className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[40%]"></div>
              <div className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[60%]"></div>
              <div className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[35%]"></div>
              <div className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[80%]"></div>
              <div className="w-full bg-primary-container rounded-t-lg h-[95%]"></div>
              <div className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[55%]"></div>
              <div className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[70%]"></div>
              <div className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[45%]"></div>
              <div className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[30%]"></div>
              <div className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[85%]"></div>
              <div className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[40%]"></div>
              <div className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[50%]"></div>
            </div>
            <div className="flex justify-between mt-md text-on-surface-variant font-label-sm">
              <span>01 Th05</span>
              <span>10 Th05</span>
              <span>20 Th05</span>
              <span>30 Th05</span>
            </div>
          </div>
          {/* <!-- Recent Activity Timeline --> */}
          <div classNameName="lg:col-span-4 bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
            <h2 classNameName="font-headline-sm mb-xl">Hoạt động gần đây</h2>
            <div classNameName="space-y-lg relative flex-1">
              <div classNameName="absolute left-3 top-2 bottom-2 w-0.5 bg-outline-variant"></div>

              {recentActivities.length === 0 ? (
                <div classNameName="text-on-surface-variant text-body-sm pl-8">
                  Chưa có hoạt động nào.
                </div>
              ) : (
                recentActivities.map((act) => {
                  const style = getActivityStyle(act.type);
                  return (
                    <div
                      key={act.id}
                      classNameName="relative flex gap-md items-start group"
                    >
                      <div
                        classNameName={`w-6 h-6 rounded-full ${style.bg} flex items-center justify-center z-10 shrink-0 shadow-sm`}
                      >
                        <span classNameName="material-symbols-outlined text-[14px]">
                          {style.icon}
                        </span>
                      </div>
                      <div classNameName="flex flex-col">
                        <Link
                          to={act.link || "#"}
                          classNameName="font-label-md text-on-surface hover:text-primary transition-colors line-clamp-1"
                        >
                          {act.title}
                        </Link>
                        <span classNameName="font-body-sm text-on-surface-variant">
                          {formatTime(act.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <Link
              to="/profile"
              state={{ tab: "recent" }}
              classNameName="mt-xl text-primary font-label-md hover:underline text-left block"
            >
              Xem tất cả trong Hồ sơ
            </Link>
          </div>
          {/* <!-- Recommended Carousel Section --> */}
          <div className="lg:col-span-12">
            <div className="flex items-center justify-between mb-lg">
              <h2 className="font-headline-sm">Gợi ý việc làm cho bạn</h2>
              <div className="flex gap-sm">
                <button className="p-xs rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>
                <button className="p-xs rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {/* <!-- Recommended Card 1 --> */}
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:scale-[1.01] transition-transform cursor-pointer group">
                <div className="flex items-start justify-between mb-md">
                  <img
                    alt="Company Logo"
                    className="w-12 h-12 rounded-lg object-cover"
                    data-alt="A minimalist tech company logo featuring abstract geometric shapes in vibrant blue and white. The aesthetic is clean, modern, and professional, representative of a cutting-edge creative agency or startup. High-resolution digital art style."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZknfDIJreikvfv_JR6d6oAkcqMA7GkzBkVfcMyiYcWJDU-nBbbtuS1VlgD9x85evDaYWNJrC8cqsblhhzX5L7unvTx6WzFv1HKQkNxec4j9FZRB0u51nSDxjfmFr01CPkSbH4IijEUNvDnHq7MljsXO7l1klIbLjRwaidCW2zSObYa6mQKPPzMcQ2W8ZKrNPF2LdsIKI9dxXzqiqtpehxlU30lfrzRXGTUduGBtvMUQLp_DG1AQJZHyBfYgOmfI7V9UTk522Hmicv"
                  />
                  <span className="bg-surface-container-high px-sm py-xs rounded-full font-label-sm text-on-surface-variant">
                    Freelance
                  </span>
                </div>
                <h4 className="font-headline-sm mb-xs group-hover:text-primary transition-colors">
                  UI/UX Product Designer
                </h4>
                <p className="font-body-sm text-on-surface-variant mb-md">
                  Creative Mind Agency • Quận 1, TP.HCM
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-primary">
                    15tr - 20tr VNĐ
                  </span>
                  <button className="bg-secondary-container text-on-secondary-container px-md py-xs rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors">
                    Chi tiết
                  </button>
                </div>
              </div>
              {/* <!-- Recommended Card 2 --> */}
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:scale-[1.01] transition-transform cursor-pointer group">
                <div className="flex items-start justify-between mb-md">
                  <img
                    alt="Company Logo"
                    className="w-12 h-12 rounded-lg object-cover"
                    data-alt="A premium food and beverage brand logo with elegant, warm tones. The design features a stylized coffee bean or cup in deep brown and gold accents, evoking a sense of high-quality hospitality and comfort. Modern corporate branding for a premium cafe chain."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd6fr3K6d3CoXlAccDlBsp94kZE_chWVsKvRKAoScn-onmkrj5TIgdLWJf6xpw-TwXR0Yx0jBv5FQns8tf7vqGD5lEig31LwXBkBRIpP1aBhncdotSpkpKWFmZqzbmihg0KURkl7UByrsZ4bc2C_Vk3dwA6MwzguDbOPsHdFmKuu_lQfqP1DCCuX-_Og3WmFYUt8NZh1v9jqjlsAJT79kggAVLvetB51pRPw5WmJ1uDAZTjOXU4YZMpjAXgFfMKRv0Znf6ZNqgcY_7"
                  />
                  <span className="bg-surface-container-high px-sm py-xs rounded-full font-label-sm text-on-surface-variant">
                    Part-time
                  </span>
                </div>
                <h4 className="font-headline-sm mb-xs group-hover:text-primary transition-colors">
                  Barista Senior
                </h4>
                <p className="font-body-sm text-on-surface-variant mb-md">
                  The Coffee House • Quận 3, TP.HCM
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-primary">
                    35k - 45k/giờ
                  </span>
                  <button className="bg-secondary-container text-on-secondary-container px-md py-xs rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors">
                    Chi tiết
                  </button>
                </div>
              </div>
              {/* <!-- Recommended Card 3 --> */}
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:scale-[1.01] transition-transform cursor-pointer group">
                <div className="flex items-start justify-between mb-md">
                  <img
                    alt="Company Logo"
                    className="w-12 h-12 rounded-lg object-cover"
                    data-alt="A clean corporate logo for a modern educational institution or tutoring center. The logo uses blue and grey tones with a book or graduation cap icon integrated into the brand name. The style is professional, trustworthy, and academic."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEZ5UPQQaCs9rcWiE1bkQPN1YdlIxRM1Fab3E0iuZ81cQk1lwdlGoSxfn91q_iGrBvePrCZDq1efxfem-YtLWrOeBDCTsNmaj8V57uQN3cLLQecwz93R-R8NxRas22zfiCNmc6jmOHM3THNars-DcagPmy8937YP79hC4kyOKZVzHUegJWpG8bS7LJ6c34_imTRdzkPzdFfQi75WWCVqtNu7DNsZK22GieAfUUP9lx_vYCMTHarUW99C9fpsFZkGM1l4gG0q_sKNMm"
                  />
                  <span className="bg-surface-container-high px-sm py-xs rounded-full font-label-sm text-on-surface-variant">
                    Freelance
                  </span>
                </div>
                <h4 className="font-headline-sm mb-xs group-hover:text-primary transition-colors">
                  Gia sư Tiếng Anh (IELTS)
                </h4>
                <p className="font-body-sm text-on-surface-variant mb-md">
                  EduGrowth Center • Online / Thủ Đức
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-primary">
                    250k - 400k/giờ
                  </span>
                  <button className="bg-secondary-container text-on-secondary-container px-md py-xs rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors">
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
