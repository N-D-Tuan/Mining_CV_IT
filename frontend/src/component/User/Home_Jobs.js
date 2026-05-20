import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  ShoppingCart,
  BookOpen,
  BriefcaseBusiness,
  Bookmark,
  Map,
} from "lucide-react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function Home_Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [heroSearchText, setHeroSearchText] = useState("");
  const [heroCityText, setHeroCityText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);

  async function fetchJobs() {
    setLoadingJobs(true);
    setJobsError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/jobs?limit=6`);
      const data = await res.json();
      if (!res.ok) {
        setJobsError(
          data.detail || data.message || "Không tải được danh sách việc làm",
        );
        setJobs([]);
      } else {
        setJobs(data.data?.items || []);
      }
    } catch (err) {
      setJobsError("Không tải được việc làm. Vui lòng thử lại sau.");
      setJobs([]);
    } finally {
      setLoadingJobs(false);
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
    return "...";
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

  const jobCategories = [
    {
      id: 1,
      icon: UtensilsCrossed,
      title: "Phục vụ",
    },
    {
      id: 2,
      icon: ShoppingCart,
      title: "Bán hàng",
    },
    {
      id: 3,
      icon: BookOpen,
      title: "Gia sư",
    },
    {
      id: 4,
      icon: BriefcaseBusiness,
      title: "Freelancer",
    },
  ];

  return (
    <>
      <main className="max-w-container-max mx-auto px-gutter py-xl">
        {/* <!-- Hero Section --> */}
        <section className="relative mb-3xl overflow-hidden rounded-3xl bg-primary py-2xl px-xl text-center">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="font-display text-display text-on-primary mb-md">
              Tìm việc part-time chất lượng ngay hôm nay
            </h1>
            <p className="font-body-lg text-primary-fixed-dim mb-2xl opacity-90">
              Hàng ngàn tin tuyển dụng được xác thực từ Facebook, LinkedIn và
              các tập đoàn lớn nhất Việt Nam.
            </p>
            <div className="flex flex-col md:flex-row gap-sm bg-surface-container-lowest p-sm rounded-2xl shadow-lg items-center">
              <div className="flex items-center gap-xs px-md flex-1 w-full border-b md:border-b-0 md:border-r border-outline-variant py-sm md:py-0">
                <span className="material-symbols-outlined text-primary">
                  work
                </span>
                <input
                  className="w-full border-none focus:ring-0 text-body-md bg-transparent"
                  placeholder="Bạn muốn làm gì?"
                  type="text"
                />
              </div>
              <div className="flex items-center gap-xs px-md flex-1 w-full py-sm md:py-0">
                <span className="material-symbols-outlined text-primary">
                  location_on
                </span>
                <input
                  className="w-full border-none focus:ring-0 text-body-md bg-transparent"
                  placeholder="Ở đâu?"
                  type="text"
                />
              </div>
              <Link to="/jobs" className="w-full md:w-auto">
                <button className="bg-primary-container text-on-primary-container font-label-md text-label-md px-2xl py-md rounded-xl hover:opacity-90 transition-all w-full md:w-auto">
                  Tìm kiếm
                </button>
              </Link>
            </div>
          </div>
          {/* <!-- Decorative background elements --> */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        </section>
        <div className="flex flex-col lg:flex-row gap-xl">
          {/* <!-- Sidebar Navigation (Categories) --> */}
          <aside className="hidden lg:flex flex-col gap-sm p-md h-fit sticky top-24 bg-surface-container-low dark:bg-surface-container-lowest h-full w-64 rounded-xl shadow-sm border-r border-outline-variant">
            <div className="mb-md">
              <h2 className="font-display text-headline-sm font-bold text-on-surface">
                Danh mục
              </h2>
              <p className="font-label-md text-label-md text-on-surface-variant opacity-70">
                Lọc theo sở trường
              </p>
            </div>
            <nav className="flex flex-col gap-xs">
              <a
                className="bg-primary-container text-on-primary-container rounded-lg p-md flex items-center gap-sm font-label-md text-label-md hover:translate-x-1 transition-transform duration-200"
                href="_"
              >
                <span className="material-symbols-outlined" data-weight="fill">
                  work
                </span>{" "}
                All Jobs
              </a>
              <a
                className="text-on-surface-variant hover:bg-surface-container-high rounded-lg p-md flex items-center gap-sm font-label-md text-label-md hover:translate-x-1 transition-transform duration-200"
                href="/"
              >
                <span className="material-symbols-outlined">restaurant</span>{" "}
                F&amp;B
              </a>
              <a
                className="text-on-surface-variant hover:bg-surface-container-high rounded-lg p-md flex items-center gap-sm font-label-md text-label-md hover:translate-x-1 transition-transform duration-200"
                href="/"
              >
                <span className="material-symbols-outlined">palette</span>{" "}
                Creative
              </a>
              <a
                className="text-on-surface-variant hover:bg-surface-container-high rounded-lg p-md flex items-center gap-sm font-label-md text-label-md hover:translate-x-1 transition-transform duration-200"
                href="/"
              >
                <span className="material-symbols-outlined">terminal</span> Tech
              </a>
              <a
                className="text-on-surface-variant hover:bg-surface-container-high rounded-lg p-md flex items-center gap-sm font-label-md text-label-md hover:translate-x-1 transition-transform duration-200"
                href="/"
              >
                <span className="material-symbols-outlined">school</span>{" "}
                Tutoring
              </a>
            </nav>
            <button className="mt-md text-primary font-label-md text-label-md hover:underline text-left px-md">
              Clear All Filters
            </button>
          </aside>
          {/* <!-- Main Content Area --> */}
          <div className="flex-1 space-y-3xl">
            {/* <!-- Section 1: Categories Cards --> */}
            <section>
              <div className="flex justify-between items-end mb-lg">
                <h2 className="font-headline-lg text-headline-lg">
                  Danh mục việc làm
                </h2>

                <a
                  className="text-primary font-label-md hover:underline"
                  href="/jobs"
                >
                  Xem tất cả
                </a>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                {jobCategories.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      className="
            bg-surface-container-lowest
            p-lg
            rounded-xl
            border border-outline-variant
            job-card-shadow
            text-center
            hover:bg-primary-fixed
            hover:border-primary
            transition-all
            duration-300
            cursor-pointer
            group
          "
                    >
                      <Icon
                        size={32}
                        className="
              text-primary
              mb-sm
              mx-auto
              group-hover:scale-110
              transition-transform
            "
                      />

                      <span className="font-label-md">{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </section>
            {/* <!-- Section 2: New Jobs Today --> */}
            <section>
              <div className="flex justify-between items-end mb-lg">
                <h2 className="font-headline-lg text-headline-lg">
                  Job mới hôm nay
                </h2>
                <Link to="/jobs">
                  <span className="text-on-surface-variant text-body-sm bg-surface-container-high px-md py-1 rounded-full">
                    {loadingJobs ? "Đang tải..." : `Xem tất cả`}
                  </span>
                </Link>
              </div>
              {jobsError && (
                <div className="rounded-xl bg-surface-container-lowest border border-red-200 text-red-700 p-md mb-lg">
                  {jobsError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
                {loadingJobs && !jobs.length ? (
                  <div className="col-span-1 md:col-span-2 xl:col-span-3 p-lg rounded-xl bg-surface-container-lowest border border-outline-variant text-center text-on-surface-variant">
                    Đang tải danh sách việc làm...
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 xl:col-span-3 p-lg rounded-xl bg-surface-container-lowest border border-outline-variant text-center text-on-surface-variant">
                    Không có việc làm phù hợp.
                  </div>
                ) : (
                  jobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="bg-surface-container-lowest p-md rounded-xl job-card-shadow job-card-hover transition-all duration-200 border border-outline-variant flex flex-col h-full group no-underline"
                    >
                      <div className="flex gap-2 items-start mb-md">
                        <div className="flex items-center gap-sm flex-1">
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
                          classNameName={`w-5 h-5 transition-colors ${savedJobIds.has(job.id) ? "text-primary" : "text-on-surface-variant"}`}
                          fill={
                            savedJobIds.has(job.id) ? "currentColor" : "none"
                          }
                        />
                      </div>
                      <div className="mt-auto">
                        <div className="text-primary font-bold text-headline-sm mb-sm">
                          {formatSalary(job)}
                        </div>
                        <div className="flex justify-between items-center text-on-surface-variant text-body-sm">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">
                              schedule
                            </span>{" "}
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
            </section>
            {/* <!-- Section 3: Personalized Matches --> */}
            <section className="bg-surface-container-low rounded-3xl p-xl">
              <div className="mb-lg">
                <h2 className="font-headline-lg text-headline-lg mb-xs">
                  Job phù hợp với bạn
                </h2>
                <p className="text-on-surface-variant text-body-md">
                  Dựa trên kỹ năng "Design" và "Marketing" của bạn
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                <div className="bg-surface-container-lowest p-lg rounded-2xl border border-primary/20 hover:border-primary transition-colors group">
                  <div className="flex items-center gap-sm mb-md">
                    <span className="bg-primary/10 text-primary p-xs rounded-lg material-symbols-outlined">
                      auto_awesome
                    </span>
                    <span className="text-label-md text-primary uppercase tracking-wider">
                      95% Match
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm mb-xs">
                    Content Creator Part-time
                  </h4>
                  <p className="text-on-surface-variant text-body-sm mb-lg">
                    Thiết kế hình ảnh &amp; viết bài cho Fanpage
                  </p>
                  <button className="w-full bg-primary text-on-primary font-label-md py-sm rounded-lg group-hover:shadow-md transition-all">
                    Ứng tuyển nhanh
                  </button>
                </div>
                <div className="bg-surface-container-lowest p-lg rounded-2xl border border-primary/20 hover:border-primary transition-colors group">
                  <div className="flex items-center gap-sm mb-md">
                    <span className="bg-primary/10 text-primary p-xs rounded-lg material-symbols-outlined">
                      auto_awesome
                    </span>
                    <span className="text-label-md text-primary uppercase tracking-wider">
                      88% Match
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm mb-xs">
                    UI Designer Shift
                  </h4>
                  <p className="text-on-surface-variant text-body-sm mb-lg">
                    Cập nhật giao diện App cho Startup mới
                  </p>
                  <button className="w-full bg-primary text-on-primary font-label-md py-sm rounded-lg group-hover:shadow-md transition-all">
                    Ứng tuyển nhanh
                  </button>
                </div>
                <div className="bg-surface-container-lowest p-lg rounded-2xl border border-primary/20 hover:border-primary transition-colors group">
                  <div className="flex items-center gap-sm mb-md">
                    <span className="bg-primary/10 text-primary p-xs rounded-lg material-symbols-outlined">
                      auto_awesome
                    </span>
                    <span className="text-label-md text-primary uppercase tracking-wider">
                      82% Match
                    </span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm mb-xs">
                    Social Media Admin
                  </h4>
                  <p className="text-on-surface-variant text-body-sm mb-lg">
                    Quản lý cộng đồng &amp; phản hồi tin nhắn
                  </p>
                  <button className="w-full bg-primary text-on-primary font-label-md py-sm rounded-lg group-hover:shadow-md transition-all">
                    Ứng tuyển nhanh
                  </button>
                </div>
              </div>
            </section>
            {/* <!-- Section 4: Jobs Near You --> */}
            <section className="space-y-xl">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    Job gần bạn
                  </h2>
                  <p className="text-body-md text-on-surface-variant mt-1">
                    Việc làm part-time cập nhật theo vị trí hiện tại
                  </p>
                </div>

                <Link
                  to="/jobs"
                  className="hidden md:flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-xl">
                {/* LEFT - Job List */}
                <div className="xl:col-span-2 space-y-md">
                  {/* CARD 1 */}
                  <div className="group bg-surface-container-lowest border border-outline-variant rounded-2xl p-md hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer">
                    <div className="flex gap-md">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDft07Ki0upndFqp1xSv1A9vkUFczG8dKdhrpmQT9BJJTdtTDQ_3_TPM4yeeFZC-6TY-YnnOI-3zBbHahNu8X64cQgtcIRGWhyiWeX4Qt-UGacUk46LXgpXhHVwnCHtG3kXRveNGxH0IX_Z6Ft8HtxNVnFj-eANiqis_Bl7qZSXf3KY41g7XpaRCBZsEAUP-pKq8tV_xnTZzAvO-JOuGCx4XQSvWh8UQjNNAsgfc5YKF2GKplhCKTrH4hB5AHIkRW2D7uwcX7sQldh0"
                        alt="Office"
                        className="w-20 h-20 rounded-2xl object-cover shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-md">
                          <div>
                            <h3 className="font-headline-sm text-headline-sm group-hover:text-primary transition-colors">
                              Lễ tân tòa nhà
                            </h3>

                            <p className="text-body-sm text-on-surface-variant mt-1">
                              Bitexco Financial Tower
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-primary font-bold text-title-md">
                              30.000đ/h
                            </p>

                            <p className="text-label-sm text-on-surface-variant">
                              500m gần đây
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-sm mt-md">
                          <span className="px-sm py-1 rounded-full bg-primary/10 text-primary text-label-sm">
                            Ca sáng
                          </span>

                          <span className="px-sm py-1 rounded-full bg-surface-container-high text-label-sm">
                            Quận 1
                          </span>

                          <span className="px-sm py-1 rounded-full bg-surface-container-high text-label-sm">
                            Part-time
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2 */}
                  <div className="group bg-surface-container-lowest border border-outline-variant rounded-2xl p-md hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer">
                    <div className="flex gap-md">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYW6sqZQDkXDlKVd7XOq_DiOAjBL9bBvAYa30JplS82UjNcZcaVGRsVPGtbVOkSO-owh7du0zwIhC5lav-RafJmuFtRBKueh4OsXXf-HdZ7co3KiFTKlWMyUtCmaIEjdo516OKBH6oZgRY9gN8eMxNNAUayqrck3lmiSfudexgGyh6c1uEKBBxgII4c9SiMdp0be5NG1xO1Rj8G-2ONbQPgpMsbWg4drJ2j9d9N8txbKcVWRa3ucqBX_uvAg7eNOmyecqh-Rtn9pah"
                        alt="Bakery"
                        className="w-20 h-20 rounded-2xl object-cover shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-md">
                          <div>
                            <h3 className="font-headline-sm text-headline-sm group-hover:text-primary transition-colors">
                              Phụ bếp bánh ngọt
                            </h3>

                            <p className="text-body-sm text-on-surface-variant mt-1">
                              ABC Bakery
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-primary font-bold text-title-md">
                              22.000đ/h
                            </p>

                            <p className="text-label-sm text-on-surface-variant">
                              1.2km gần đây
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-sm mt-md">
                          <span className="px-sm py-1 rounded-full bg-secondary/10 text-secondary text-label-sm">
                            Ca chiều
                          </span>

                          <span className="px-sm py-1 rounded-full bg-surface-container-high text-label-sm">
                            Quận 4
                          </span>

                          <span className="px-sm py-1 rounded-full bg-surface-container-high text-label-sm">
                            Bán thời gian
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT - MAP */}
                <div className="relative overflow-hidden rounded-3xl border border-outline-variant min-h-[360px] group">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUX7SLPKGKzEHLK9_gWNLVciQOvrrUCOKfqtp7xuzrmE_OpSlP3i8-oajGmMVvTU51dTBlhytTCM1-CWas7lnZGkSonC8BAB8Wq63fuQUV5WpEuoQ0Sl_3Xl8lqG92rCrzrvCfeFTe8KzxqRPR1NysDfTK4jK9xoN4F06YaTTfnLAVcx60mOb05b_71rFvUruTxNvLdu8WC5Swml0ONACL80w0Bf5mQ-Sgoca9LNvKq1DDfNougK-q5A-PadcQcl0yOGKsZj5-WcwG"
                    alt="Map Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                  {/* Floating Info */}
                  <div className="absolute top-md left-md bg-white/90 backdrop-blur-md px-md py-sm rounded-2xl shadow-md">
                    <p className="text-label-sm text-on-surface-variant">
                      120+ việc làm gần đây
                    </p>

                    <p className="font-semibold text-on-surface">Đà Nẵng</p>
                  </div>

                  {/* CTA */}
                  <Link
                    to="/jobs/map"
                    className="
    absolute
    bottom-lg
    left-1/2
    -translate-x-1/2

    inline-flex
    items-center
    justify-center
    gap-2

    min-w-[200px]
    whitespace-nowrap

    bg-primary
    text-white

    px-4
    py-3

    rounded-full
    shadow-xl

    hover:scale-105
    hover:shadow-2xl

    transition-all
    duration-300

    text-sm
    font-semibold
  "
                  >
                    <Map size={24} strokeWidth={2.2} />
                    <span>Xem bản đồ lớn</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
