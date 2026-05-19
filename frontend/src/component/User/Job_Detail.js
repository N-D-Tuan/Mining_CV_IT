import { useEffect, useState, useRef} from "react";
import { Link, useParams } from "react-router-dom";
import { Bookmark } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function Job_Detail() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState("description");
    const [saved, setSaved] = useState(false);
    const [applied, setApplied] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [applyLoading, setApplyLoading] = useState(false);
    const [related, setRelated] = useState([]);
    const hasRecordedView = useRef(false);

    const recordActivity = (type, title, url) => {
        const activities = JSON.parse(localStorage.getItem("recentActivities") || "[]");
        activities.unshift({
            id: Date.now(),
            type,
            title,
            timestamp: new Date().toISOString(),
            link: url
        });
        localStorage.setItem("recentActivities", JSON.stringify(activities.slice(0, 50)));
    };

    useEffect(() => {
        hasRecordedView.current = false;
        if (!id) return;
        fetchJob();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function fetchJob() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/jobs/${id}`);
            const data = await res.json();
            if (!res.ok) {
                setError(data.detail || data.message || "Không tải được chi tiết job");
                setJob(null);
            } else {
                const jobData = data.data || null;
                setJob(jobData);
                fetchRelated(jobData);
                await fetchSavedStatus(id);
                await fetchAppliedStatus(id);

                if (jobData && !hasRecordedView.current) {
                    recordActivity("view", `Đã xem: ${jobData.title}`, `/jobs/${id}`);
                    hasRecordedView.current = true; // Đánh dấu là đã lưu để request thứ 2 bị chặn lại
                }
            }
        } catch (err) {
            setError("Lỗi khi tải dữ liệu. Vui lòng thử lại");
            setJob(null);
        } finally {
            setLoading(false);
        }
    }

    async function fetchSavedStatus(jobId) {
        try {
            const res = await fetch(`${API_BASE}/api/v1/users/saved-jobs/${jobId}`, {
                credentials: "include",
            });
            if (!res.ok) return;
            const data = await res.json();
            setSaved(!!data.data?.saved);
        } catch (e) {
            // ignore auth errors
        }
    }

    async function fetchAppliedStatus(jobId) {
        try {
            const res = await fetch(`${API_BASE}/api/v1/users/applied-jobs/${jobId}`, {
                credentials: "include",
            });
            if (!res.ok) return;
            const data = await res.json();
            setApplied(!!data.data?.applied);
        } catch (e) {
            // ignore auth errors
        }
    }

    async function fetchRelated(jobData) {
        if (!jobData) return;
        try {
            const params = new URLSearchParams();
            params.set("limit", 3);
            if (jobData.title) params.set("title", jobData.title);
            const res = await fetch(`${API_BASE}/api/v1/jobs?${params.toString()}`);
            const data = await res.json();
            if (res.ok) setRelated((data.data?.items || []).filter((j) => j.id !== jobData.id));
        } catch (e) {
            // ignore related errors
        }
    }

    function formatSalary(job) {
        if (!job) return "-";
        if (job.min_salary != null && job.max_salary != null) {
            return `${job.min_salary.toLocaleString("vi-VN")}đ - ${job.max_salary.toLocaleString("vi-VN")}đ`;
        }
        if (job.min_salary != null) return `${job.min_salary.toLocaleString("vi-VN")}đ`;
        if (job.max_salary != null) return `${job.max_salary.toLocaleString("vi-VN")}đ`;
        return job.raw_salary || "Thương lượng";
    }

    function formatPostedTime(job) {
        if (!job || !job.created_at) return "Mới đăng";
        const date = new Date(job.created_at);
        return date.toLocaleDateString("vi-VN");
    }

    async function handleApply() {
        if (!job || applyLoading) return;
        setApplyLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/users/applied-jobs/${id}`, {
                method: "POST",
                credentials: "include",
            });
            const body = await res.json();
            if (!res.ok) {
                alert(body.detail || body.message || "Không thể ứng tuyển");
                return;
            }
            setApplied(true);

            recordActivity("apply", `Đã ứng tuyển: ${job.title}`, `/jobs/${id}`);

            if (job.link) {
                window.open(job.link, "_blank");
            } else {
                alert(body.message || "Ứng tuyển thành công");
            }
        } catch (err) {
            alert("Lỗi khi ứng tuyển. Vui lòng thử lại.");
        } finally {
            setApplyLoading(false);
        }
    }

    async function toggleSave() {
        if (saveLoading) return;
        setSaveLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/users/saved-jobs/${id}`, {
                method: saved ? "DELETE" : "POST",
                credentials: "include",
            });
            const body = await res.json();
            if (!res.ok) {
                alert(body.detail || body.message || "Không thể lưu công việc");
                return;
            }
            setSaved(!saved);

            recordActivity(saved ? "unsave" : "save", `${saved ? 'Bỏ lưu' : 'Đã lưu'}: ${job.title}`, `/jobs/${id}`);
        } catch (err) {
            alert("Lỗi khi lưu công việc. Vui lòng thử lại.");
        } finally {
            setSaveLoading(false);
        }
    }

    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert("Đã sao chép liên kết");
        } catch (e) {
            alert("Không thể sao chép liên kết");
        }
    }

    if (loading) {
        return (
            <main className="max-w-container-max mx-auto px-gutter py-xl">
                <div className="p-lg rounded-xl bg-surface-container-lowest border border-outline-variant">Đang tải...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="max-w-container-max mx-auto px-gutter py-xl">
                <div className="p-lg rounded-xl bg-surface-container-lowest border border-red-200 text-red-700">{error}</div>
            </main>
        );
    }

    return (
        <main className="max-w-container-max mx-auto px-gutter py-xl">
            <div className="flex flex-col lg:flex-row gap-xl">
                <div className="w-full lg:w-[70%] space-y-lg">
                    <header className="bg-surface-container-lowest p-xl rounded-xl shadow-sm border border-outline-variant">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-md">
                            <div className="space-y-sm">
                                <h1 className="font-display text-headline-lg font-bold text-on-surface">{job?.title || "-"}</h1>
                                <div className="flex flex-wrap items-center gap-md text-on-surface-variant">
                                    <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[18px]">business</span> {job?.employer_name || job?.source || "Nhà tuyển dụng"}</span>
                                    <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[18px]">schedule</span> {formatPostedTime(job)}</span>
                                    <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[18px]">location_on</span> {job?.city || job?.address || "—"}</span>
                                </div>
                            </div>
                            <div className="bg-primary-container/10 text-primary-container px-md py-sm rounded-lg font-bold text-headline-sm">{formatSalary(job)}</div>
                        </div>
                    </header>

                    <div className="flex border-b border-outline-variant gap-xl">
                        <button onClick={() => setTab("description")} className={`pb-md font-label-md text-label-md ${tab === "description" ? "border-b-2 border-primary text-primary font-bold" : "text-on-surface-variant hover:text-primary"}`}>Mô tả công việc</button>
                        <button onClick={() => setTab("requirements")} className={`pb-md font-label-md text-label-md ${tab === "requirements" ? "border-b-2 border-primary text-primary font-bold" : "text-on-surface-variant hover:text-primary"}`}>Yêu cầu</button>
                        <button onClick={() => setTab("benefits")} className={`pb-md font-label-md text-label-md ${tab === "benefits" ? "border-b-2 border-primary text-primary font-bold" : "text-on-surface-variant hover:text-primary"}`}>Quyền lợi</button>
                    </div>

                    <article className="bg-surface-container-lowest p-xl rounded-xl shadow-sm border border-outline-variant space-y-xl">
                        {tab === "description" && (
                            <section>
                                <h2 className="font-display text-headline-sm font-bold text-on-surface mb-md">Mô tả công việc</h2>
                                <div className="text-on-surface-variant leading-relaxed font-body-md text-body-md" dangerouslySetInnerHTML={{ __html: job?.post_content || job?.raw_salary || "Không có mô tả" }} />
                            </section>
                        )}

                        {tab === "requirements" && (
                            <section>
                                <h2 className="font-display text-headline-sm font-bold text-on-surface mb-md">Yêu cầu công việc</h2>
                                {Array.isArray(job?.requirements) && job.requirements.length ? (
                                    <ul className="space-y-sm">
                                        {job.requirements.map((r, i) => (
                                            <li key={i} className="flex items-start gap-sm text-on-surface-variant">
                                                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                                <span className="font-body-md text-body-md">{r}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-on-surface-variant">Không có thông tin yêu cầu.</div>
                                )}
                            </section>
                        )}

                        {tab === "benefits" && (
                            <section>
                                <h2 className="font-display text-headline-sm font-bold text-on-surface mb-md">Quyền lợi</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                    {/* Fallback: try to parse some benefits from post_content or show placeholder */}
                                    <div className="p-md bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-center gap-md">
                                        <span className="material-symbols-outlined text-primary bg-primary/10 p-sm rounded-full">payments</span>
                                        <span className="font-label-md text-label-md">{job?.salary_type || 'Lương thưởng cạnh tranh'}</span>
                                    </div>
                                    <div className="p-md bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-center gap-md">
                                        <span className="material-symbols-outlined text-primary bg-primary/10 p-sm rounded-full">coffee</span>
                                        <span className="font-label-md text-label-md">Môi trường làm việc năng động</span>
                                    </div>
                                    <div className="p-md bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-center gap-md">
                                        <span className="material-symbols-outlined text-primary bg-primary/10 p-sm rounded-full">laptop_mac</span>
                                        <span className="font-label-md text-label-md">Hỗ trợ thiết bị</span>
                                    </div>
                                    <div className="p-md bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-center gap-md">
                                        <span className="material-symbols-outlined text-primary bg-primary/10 p-sm rounded-full">home_work</span>
                                        <span className="font-label-md text-label-md">Làm việc linh hoạt</span>
                                    </div>
                                </div>
                            </section>
                        )}

                        <hr className="border-outline-variant" />
                        <section className="flex items-center justify-between">
                            <div className="flex items-center gap-md">
                                <div>
                                    <h4 className="font-headline-sm text-headline-sm font-bold">{job?.employer_name || job?.source || "Nhà tuyển dụng"}</h4>
                                    <p className="text-on-surface-variant font-body-sm text-body-sm">{job?.employer_name ? `${job.employer_name}` : "Recruiter"}</p>
                                </div>
                            </div>
                            <button onClick={() => window.open(job.link, '_blank')} className="text-primary font-bold hover:underline transition-all">Xem bài đăng</button>
                        </section>
                    </article>
                </div>

                <aside className="w-full lg:w-[30%]">
                    <div className="sticky-sidebar space-y-lg">
                        <div className="bg-surface-container-lowest p-xl rounded-xl shadow-sm border border-outline-variant space-y-md">
                            <button disabled={applyLoading || applied} onClick={handleApply} className="w-full bg-primary-container text-on-primary-container py-md rounded-xl font-bold flex items-center justify-center gap-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                <span className="material-symbols-outlined">send</span>
                                {applied ? 'Đã ứng tuyển' : applyLoading ? 'Đang ứng tuyển...' : 'Ứng tuyển ngay'}
                            </button>
                            <button
  disabled={saveLoading}
  onClick={toggleSave}
  className="
    w-full
    border border-outline-variant
    text-primary
    py-md
    rounded-xl
    font-bold
    flex items-center
    justify-center
    gap-sm
    hover:bg-surface-container-low
    active:scale-[0.98]
    transition-all
    disabled:opacity-50
    disabled:cursor-not-allowed
  "
>
  <Bookmark
    className={`w-5 h-5 transition-colors ${
      saved ? "text-primary" : "text-on-surface-variant"
    }`}
    fill={saved ? "currentColor" : "none"}
  />

  {saved
    ? "Đã lưu"
    : saveLoading
    ? "Đang xử lý..."
    : "Lưu công việc"}
</button>

                            <div className="pt-md space-y-md border-t border-outline-variant">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-sm text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[20px]">access_time</span>
                                        <span className="font-body-sm text-body-sm">Thời gian</span>
                                    </div>
                                    <span className="font-label-md text-label-md">{job?.hours || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-sm text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[20px]">group</span>
                                        <span className="font-body-sm text-body-sm">Số lượng</span>
                                    </div>
                                    <span className="font-label-md text-label-md">{job?.headcount || '—'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-sm text-on-surface-variant">
                                        <span className="material-symbols-outlined text-[20px]">event_busy</span>
                                        <span className="font-body-sm text-body-sm">Hạn nộp</span>
                                    </div>
                                    <span className="font-label-md text-label-md text-error">{job?.deadline || '—'}</span>
                                </div>
                            </div>

                            <div className="pt-md space-y-sm">
                                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Chia sẻ công việc</p>
                                <div className="flex gap-md">
                                    <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary/10 transition-colors">
                                        <img alt="Facebook" className="w-5 h-5" src="/html_css_js/facebook.svg" />
                                    </button>
                                    <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary/10 transition-colors">
                                        <img alt="LinkedIn" className="w-5 h-5" src="/html_css_js/linkedin.svg" />
                                    </button>
                                    <button onClick={handleCopyLink} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary/10 transition-colors">
                                        <img alt="Link" className="w-5 h-5" src="/html_css_js/link.svg" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 p-lg rounded-xl border border-primary/20">
                            <div className="flex items-center gap-sm text-primary mb-sm">
                                <span className="material-symbols-outlined">shield</span>
                                <span className="font-bold font-label-md text-label-md">Mẹo an toàn</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Không bao giờ trả bất kỳ khoản phí nào để xin việc. Hãy báo cáo nếu thấy dấu hiệu nghi ngờ.</p>
                        </div>
                    </div>
                </aside>
            </div>

            <section className="mt-3xl">
                <div className="flex justify-between items-center mb-xl">
                    <h2 className="font-display text-headline-md font-bold text-on-surface">Việc làm tương tự</h2>
                    <Link to="/jobs" className="text-primary font-bold flex items-center gap-xs hover:gap-md transition-all">Xem tất cả <span className="material-symbols-outlined">arrow_forward</span></Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                    {related.map((r) => (
                        <Link key={r.id} to={`/jobs/${r.id}`} className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:scale-[1.01] transition-transform duration-200 block">
                            <div className="flex items-start gap-md mb-md">
                                <div>
                                    <h3 className="font-headline-sm text-headline-sm font-bold line-clamp-1">{r.title}</h3>
                                    <p className="text-on-surface-variant font-body-sm text-body-sm">{r.employer_name || r.source}</p>
                                </div>
                            </div>
                            <div className="space-y-md">
                                <div className="flex items-center gap-sm text-on-surface-variant font-body-sm text-body-sm"><span className="material-symbols-outlined text-[18px]">location_on</span> {r.city || r.address || '-'}</div>
                                <div className="flex items-center justify-between">
                                    <span className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded text-label-sm font-label-sm">{r.job_type || 'Part-time'}</span>
                                    <span className="text-primary font-bold">{r.min_salary || r.raw_salary || '-'}{r.max_salary ? ` - ${r.max_salary}` : ''}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}