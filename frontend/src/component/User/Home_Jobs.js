import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";

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
                setJobsError(data.detail || data.message || "Không tải được danh sách việc làm");
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
            return `${job.min_salary.toLocaleString('vi-VN')}đ - ${job.max_salary.toLocaleString('vi-VN')}đ`;
        }
        if (job.min_salary != null) {
            return `${job.min_salary.toLocaleString('vi-VN')}đ`;
        }
        if (job.max_salary != null) {
            return `${job.max_salary.toLocaleString('vi-VN')}đ`;
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
        return date.toLocaleDateString('vi-VN');
    }

    const jobCategories = [
        {
            id: 1,
            icon: "restaurant",
            title: "Phục vụ",
        },
        {
            id: 2,
            icon: "shopping_cart",
            title: "Bán hàng",
        },
        {
            id: 3,
            icon: "history_edu",
            title: "Gia sư",
        },
        {
            id: 4,
            icon: "person_apron",
            title: "Freelancer",
        },
    ];

    return (
        <>
            <main class="max-w-container-max mx-auto px-gutter py-xl">
                {/* <!-- Hero Section --> */}
                <section class="relative mb-3xl overflow-hidden rounded-3xl bg-primary py-2xl px-xl text-center">
                    <div class="relative z-10 max-w-3xl mx-auto">
                        <h1 class="font-display text-display text-on-primary mb-md">Tìm việc part-time chất lượng ngay hôm nay
                        </h1>
                        <p class="font-body-lg text-primary-fixed-dim mb-2xl opacity-90">Hàng ngàn tin tuyển dụng được xác thực
                            từ Facebook, LinkedIn và các tập đoàn lớn nhất Việt Nam.</p>
                        <div
                            class="flex flex-col md:flex-row gap-sm bg-surface-container-lowest p-sm rounded-2xl shadow-lg items-center">
                            <div
                                class="flex items-center gap-xs px-md flex-1 w-full border-b md:border-b-0 md:border-r border-outline-variant py-sm md:py-0">
                                <span class="material-symbols-outlined text-primary">work</span>
                                <input class="w-full border-none focus:ring-0 text-body-md bg-transparent"
                                    placeholder="Bạn muốn làm gì?" type="text" />
                            </div>
                            <div class="flex items-center gap-xs px-md flex-1 w-full py-sm md:py-0">
                                <span class="material-symbols-outlined text-primary">location_on</span>
                                <input class="w-full border-none focus:ring-0 text-body-md bg-transparent" placeholder="Ở đâu?"
                                    type="text" />
                            </div>
                            <Link to="/jobs" class="w-full md:w-auto">
                                <button
                                    class="bg-primary-container text-on-primary-container font-label-md text-label-md px-2xl py-md rounded-xl hover:opacity-90 transition-all w-full md:w-auto">Tìm
                                    kiếm</button>
                            </Link>
                        </div>
                    </div>
                    {/* <!-- Decorative background elements --> */}
                    <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                    <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
                </section>
                <div class="flex flex-col lg:flex-row gap-xl">
                    {/* <!-- Sidebar Navigation (Categories) --> */}
                    <aside
                        class="hidden lg:flex flex-col gap-sm p-md h-fit sticky top-24 bg-surface-container-low dark:bg-surface-container-lowest h-full w-64 rounded-xl shadow-sm border-r border-outline-variant">
                        <div class="mb-md">
                            <h2 class="font-display text-headline-sm font-bold text-on-surface">Danh mục</h2>
                            <p class="font-label-md text-label-md text-on-surface-variant opacity-70">Lọc theo sở trường</p>
                        </div>
                        <nav class="flex flex-col gap-xs">
                            <a class="bg-primary-container text-on-primary-container rounded-lg p-md flex items-center gap-sm font-label-md text-label-md hover:translate-x-1 transition-transform duration-200"
                                href="#">
                                <span class="material-symbols-outlined" data-weight="fill">work</span> All Jobs
                            </a>
                            <a class="text-on-surface-variant hover:bg-surface-container-high rounded-lg p-md flex items-center gap-sm font-label-md text-label-md hover:translate-x-1 transition-transform duration-200"
                                href="#">
                                <span class="material-symbols-outlined">restaurant</span> F&amp;B
                            </a>
                            <a class="text-on-surface-variant hover:bg-surface-container-high rounded-lg p-md flex items-center gap-sm font-label-md text-label-md hover:translate-x-1 transition-transform duration-200"
                                href="#">
                                <span class="material-symbols-outlined">palette</span> Creative
                            </a>
                            <a class="text-on-surface-variant hover:bg-surface-container-high rounded-lg p-md flex items-center gap-sm font-label-md text-label-md hover:translate-x-1 transition-transform duration-200"
                                href="#">
                                <span class="material-symbols-outlined">terminal</span> Tech
                            </a>
                            <a class="text-on-surface-variant hover:bg-surface-container-high rounded-lg p-md flex items-center gap-sm font-label-md text-label-md hover:translate-x-1 transition-transform duration-200"
                                href="#">
                                <span class="material-symbols-outlined">school</span> Tutoring
                            </a>
                        </nav>
                        <button class="mt-md text-primary font-label-md text-label-md hover:underline text-left px-md">Clear All
                            Filters</button>
                    </aside>
                    {/* <!-- Main Content Area --> */}
                    <div class="flex-1 space-y-3xl">
                        {/* <!-- Section 1: Categories Cards --> */}
                        <section>
                            <div class="flex justify-between items-end mb-lg">
                                <h2 class="font-headline-lg text-headline-lg">Danh mục việc làm</h2>
                                <a class="text-primary font-label-md hover:underline" href="#">Xem tất cả</a>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                                {jobCategories.map((item) => (
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
                                        <span
                                            className="
                                                material-symbols-outlined
                                                text-primary
                                                mb-sm
                                                block
                                                text-3xl
                                                group-hover:scale-110
                                                transition-transform
                                                "
                                        >
                                            {item.icon}
                                        </span>

                                        <span className="font-label-md">
                                            {item.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                        {/* <!-- Section 2: New Jobs Today --> */}
                        <section>
                            <div class="flex justify-between items-end mb-lg">
                                <h2 class="font-headline-lg text-headline-lg">Job mới hôm nay</h2>
                                <Link to="/jobs" >
                                    <span class="text-on-surface-variant text-body-sm bg-surface-container-high px-md py-1 rounded-full">
                                        {loadingJobs ? 'Đang tải...' : `Xem tất cả`}
                                    </span>
                                </Link>

                            </div>
                            {jobsError && (
                                <div class="rounded-xl bg-surface-container-lowest border border-red-200 text-red-700 p-md mb-lg">
                                    {jobsError}
                                </div>
                            )}
                            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
                                {loadingJobs && !jobs.length ? (
                                    <div class="col-span-1 md:col-span-2 xl:col-span-3 p-lg rounded-xl bg-surface-container-lowest border border-outline-variant text-center text-on-surface-variant">
                                        Đang tải danh sách việc làm...
                                    </div>
                                ) : jobs.length === 0 ? (
                                    <div class="col-span-1 md:col-span-2 xl:col-span-3 p-lg rounded-xl bg-surface-container-lowest border border-outline-variant text-center text-on-surface-variant">
                                        Không có việc làm phù hợp.
                                    </div>
                                ) : (
                                    jobs.map((job) => (
                                        <Link key={job.id} to={`/jobs/${job.id}`} class="bg-surface-container-lowest p-md rounded-xl job-card-shadow job-card-hover transition-all duration-200 border border-outline-variant flex flex-col h-full group no-underline">
                                            <div class="flex gap-2 items-start mb-md">
                                                <div class="flex items-center gap-sm flex-1">
                                                    <div>
                                                        <h3 class="font-headline-sm text-headline-sm mb-xs group-hover:text-primary transition-colors job-card-title-clamp-2">
                                                            {job.title || 'Không rõ tên vị trí'}</h3>
                                                        <p class="text-on-surface-variant text-body-sm job-card-meta-clamp-2">
                                                            {formatSource(job)} • {formatLocation(job)}</p>
                                                    </div>
                                                </div>
                                                <Bookmark
                                                    className={`w-5 h-5 transition-colors ${savedJobIds.has(job.id) ? 'text-primary' : 'text-on-surface-variant'}`}
                                                    fill={savedJobIds.has(job.id) ? 'currentColor' : 'none'}
                                                />
                                            </div>
                                            <div class="mt-auto">
                                                <div class="text-primary font-bold text-headline-sm mb-sm">{formatSalary(job)}</div>
                                                <div class="flex justify-between items-center text-on-surface-variant text-body-sm">
                                                    <span class="flex items-center gap-1"><span
                                                        class="material-symbols-outlined text-[16px]">schedule</span> {formatPostedTime(job)}</span>
                                                    <span
                                                        class="bg-secondary-container px-sm py-[2px] rounded text-on-secondary-container text-label-sm">{formatType(job)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </section>
                        {/* <!-- Section 3: Personalized Matches --> */}
                        <section class="bg-surface-container-low rounded-3xl p-xl">
                            <div class="mb-lg">
                                <h2 class="font-headline-lg text-headline-lg mb-xs">Job phù hợp với bạn</h2>
                                <p class="text-on-surface-variant text-body-md">Dựa trên kỹ năng "Design" và "Marketing" của bạn
                                </p>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-lg">
                                <div
                                    class="bg-surface-container-lowest p-lg rounded-2xl border border-primary/20 hover:border-primary transition-colors group">
                                    <div class="flex items-center gap-sm mb-md">
                                        <span
                                            class="bg-primary/10 text-primary p-xs rounded-lg material-symbols-outlined">auto_awesome</span>
                                        <span class="text-label-md text-primary uppercase tracking-wider">95% Match</span>
                                    </div>
                                    <h4 class="font-headline-sm text-headline-sm mb-xs">Content Creator Part-time</h4>
                                    <p class="text-on-surface-variant text-body-sm mb-lg">Thiết kế hình ảnh &amp; viết bài cho
                                        Fanpage</p>
                                    <button
                                        class="w-full bg-primary text-on-primary font-label-md py-sm rounded-lg group-hover:shadow-md transition-all">Ứng
                                        tuyển nhanh</button>
                                </div>
                                <div
                                    class="bg-surface-container-lowest p-lg rounded-2xl border border-primary/20 hover:border-primary transition-colors group">
                                    <div class="flex items-center gap-sm mb-md">
                                        <span
                                            class="bg-primary/10 text-primary p-xs rounded-lg material-symbols-outlined">auto_awesome</span>
                                        <span class="text-label-md text-primary uppercase tracking-wider">88% Match</span>
                                    </div>
                                    <h4 class="font-headline-sm text-headline-sm mb-xs">UI Designer Shift</h4>
                                    <p class="text-on-surface-variant text-body-sm mb-lg">Cập nhật giao diện App cho Startup mới
                                    </p>
                                    <button
                                        class="w-full bg-primary text-on-primary font-label-md py-sm rounded-lg group-hover:shadow-md transition-all">Ứng
                                        tuyển nhanh</button>
                                </div>
                                <div
                                    class="bg-surface-container-lowest p-lg rounded-2xl border border-primary/20 hover:border-primary transition-colors group">
                                    <div class="flex items-center gap-sm mb-md">
                                        <span
                                            class="bg-primary/10 text-primary p-xs rounded-lg material-symbols-outlined">auto_awesome</span>
                                        <span class="text-label-md text-primary uppercase tracking-wider">82% Match</span>
                                    </div>
                                    <h4 class="font-headline-sm text-headline-sm mb-xs">Social Media Admin</h4>
                                    <p class="text-on-surface-variant text-body-sm mb-lg">Quản lý cộng đồng &amp; phản hồi tin
                                        nhắn</p>
                                    <button
                                        class="w-full bg-primary text-on-primary font-label-md py-sm rounded-lg group-hover:shadow-md transition-all">Ứng
                                        tuyển nhanh</button>
                                </div>
                            </div>
                        </section>
                        {/* <!-- Section 4: Jobs Near You --> */}
                        <section>
                            <h2 class="font-headline-lg text-headline-lg mb-lg">Job gần bạn</h2>
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-xl">
                                <div class="lg:col-span-2 space-y-md">
                                    <div
                                        class="flex gap-md bg-surface-container-lowest p-md rounded-xl border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer group">
                                        <img alt="Office" class="w-16 h-16 rounded-xl object-cover bg-surface-container"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDft07Ki0upndFqp1xSv1A9vkUFczG8dKdhrpmQT9BJJTdtTDQ_3_TPM4yeeFZC-6TY-YnnOI-3zBbHahNu8X64cQgtcIRGWhyiWeX4Qt-UGacUk46LXgpXhHVwnCHtG3kXRveNGxH0IX_Z6Ft8HtxNVnFj-eANiqis_Bl7qZSXf3KY41g7XpaRCBZsEAUP-pKq8tV_xnTZzAvO-JOuGCx4XQSvWh8UQjNNAsgfc5YKF2GKplhCKTrH4hB5AHIkRW2D7uwcX7sQldh0" />
                                        <div class="flex-1">
                                            <div class="flex justify-between items-start">
                                                <h4
                                                    class="font-headline-sm text-headline-sm group-hover:text-primary transition-colors">
                                                    Lễ tân tòa nhà</h4>
                                                <span class="text-primary font-bold text-body-md">30.000đ/h</span>
                                            </div>
                                            <p class="text-on-surface-variant text-body-sm">Bitexco Financial Tower • 500m gần
                                                đây</p>
                                            <div class="mt-sm flex gap-xs">
                                                <span class="text-label-sm bg-surface-container-high px-sm py-1 rounded">Ca
                                                    Sáng</span>
                                                <span
                                                    class="text-label-sm bg-surface-container-high px-sm py-1 rounded">Q.1</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="flex gap-md bg-surface-container-lowest p-md rounded-xl border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer group">
                                        <img alt="Bakery" class="w-16 h-16 rounded-xl object-cover bg-surface-container"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYW6sqZQDkXDlKVd7XOq_DiOAjBL9bBvAYa30JplS82UjNcZcaVGRsVPGtbVOkSO-owh7du0zwIhC5lav-RafJmuFtRBKueh4OsXXf-HdZ7co3KiFTKlWMyUtCmaIEjdo516OKBH6oZgRY9gN8eMxNNAUayqrck3lmiSfudexgGyh6c1uEKBBxgII4c9SiMdp0be5NG1xO1Rj8G-2ONbQPgpMsbWg4drJ2j9d9N8txbKcVWRa3ucqBX_uvAg7eNOmyecqh-Rtn9pah" />
                                        <div class="flex-1">
                                            <div class="flex justify-between items-start">
                                                <h4
                                                    class="font-headline-sm text-headline-sm group-hover:text-primary transition-colors">
                                                    Phụ bếp bánh ngọt</h4>
                                                <span class="text-primary font-bold text-body-md">22.000đ/h</span>
                                            </div>
                                            <p class="text-on-surface-variant text-body-sm">ABC Bakery • 1.2km gần đây</p>
                                            <div class="mt-sm flex gap-xs">
                                                <span class="text-label-sm bg-surface-container-high px-sm py-1 rounded">Ca
                                                    Chiều</span>
                                                <span
                                                    class="text-label-sm bg-surface-container-high px-sm py-1 rounded">Q.4</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="relative rounded-2xl overflow-hidden min-h-[300px] border border-outline-variant">
                                    {/* <!-- Map Preview Mock --> */}
                                    <img class="w-full h-full object-cover"
                                        data-alt="A stylized minimalist map of a modern metropolitan area with clean white roads and soft blue water features. The map uses a light-mode color palette of pastel grays and whites, with vibrant blue pin markers indicating job locations across the city grid. The aesthetic is modern, functional, and aligns with high-end tech platform navigation interfaces."
                                        data-location="Ho Chi Minh City"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUX7SLPKGKzEHLK9_gWNLVciQOvrrUCOKfqtp7xuzrmE_OpSlP3i8-oajGmMVvTU51dTBlhytTCM1-CWas7lnZGkSonC8BAB8Wq63fuQUV5WpEuoQ0Sl_3Xl8lqG92rCrzrvCfeFTe8KzxqRPR1NysDfTK4jK9xoN4F06YaTTfnLAVcx60mOb05b_71rFvUruTxNvLdu8WC5Swml0ONACL80w0Bf5mQ-Sgoca9LNvKq1DDfNougK-q5A-PadcQcl0yOGKsZj5-WcwG" />
                                    <div class="absolute inset-0 bg-primary/10 pointer-events-none"></div>
                                    <button
                                        class="absolute bottom-md left-1/2 -translate-x-1/2 bg-surface-container-lowest text-primary px-xl py-sm rounded-full shadow-lg font-label-md flex items-center gap-xs">
                                        <span class="material-symbols-outlined">map</span> Xem bản đồ lớn
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}