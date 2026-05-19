import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

function emptyValue(value) {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    return false;
}

function formatField(value) {
    return emptyValue(value) ? 'Chưa cập nhật' : value;
}

function formatSalary(value) {
    if (value == null) return 'Chưa cập nhật';
    return `${value.toLocaleString('vi-VN')}đ`;
}

export default function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'saved');
    const [savedJobs, setSavedJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [loadingSavedJobs, setLoadingSavedJobs] = useState(false);
    const [loadingAppliedJobs, setLoadingAppliedJobs] = useState(false);
    const [jobsError, setJobsError] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        if (location.state && location.state.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);
    
    useEffect(() => {
        fetchProfile();
        fetchSavedJobs();
        fetchAppliedJobs();

        const stored = JSON.parse(localStorage.getItem("recentActivities") || "[]");
        setRecentActivities(stored);
    }, []);

    async function fetchProfile() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/users/profile`, {
                credentials: 'include',
            });
            const body = await res.json();
            if (!res.ok) {
                throw new Error(body.detail || body.message || 'Không thể tải hồ sơ');
            }
            setProfile(body.data || {});
        } catch (err) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    }

    async function fetchSavedJobs() {
        setLoadingSavedJobs(true);
        setJobsError(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/users/saved-jobs?limit=100`, {
                credentials: 'include',
            });
            const body = await res.json();
            if (!res.ok) {
                throw new Error(body.detail || body.message || 'Không thể tải danh sách công việc đã lưu');
            }
            setSavedJobs(body.data?.items || []);
        } catch (err) {
            setJobsError(err.message || String(err));
            setSavedJobs([]);
        } finally {
            setLoadingSavedJobs(false);
        }
    }

    async function fetchAppliedJobs() {
        setLoadingAppliedJobs(true);
        setJobsError(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/users/applied-jobs?limit=100`, {
                credentials: 'include',
            });
            const body = await res.json();
            if (!res.ok) {
                throw new Error(body.detail || body.message || 'Không thể tải danh sách công việc đã ứng tuyển');
            }
            setAppliedJobs(body.data?.items || []);
        } catch (err) {
            setJobsError(err.message || String(err));
            setAppliedJobs([]);
        } finally {
            setLoadingAppliedJobs(false);
        }
    }

    function formatJobSalary(job) {
        if (job.min_salary != null && job.max_salary != null) {
            return `${job.min_salary.toLocaleString('vi-VN')}đ - ${job.max_salary.toLocaleString('vi-VN')}đ`;
        }
        if (job.min_salary != null) {
            return `${job.min_salary.toLocaleString('vi-VN')}đ`;
        }
        if (job.max_salary != null) {
            return `${job.max_salary.toLocaleString('vi-VN')}đ`;
        }
        return 'Chưa cập nhật';
    }

    function formatLocation(job) {
        return job.city || job.address || 'Chưa cập nhật';
    }

    function renderJobCard(job) {
        return (
            <div key={job.id} className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-all group">
                <Link to={`/jobs/${job.id}`} className="block mb-xs hover:text-primary transition-colors">
                    <h4 className="font-headline-sm text-on-surface mb-xs group-hover:text-primary transition-colors">
                        {job.title || 'Tên công việc chưa có'}
                    </h4>
                </Link>
                <p className="text-body-sm text-on-surface-variant mb-lg">{job.employer_name || 'Nhà tuyển dụng'} • {formatLocation(job)}</p>
                <div className="flex flex-wrap gap-xs mb-xl">
                    <span className="bg-secondary-container text-on-secondary-container px-sm py-[2px] rounded text-label-sm">{job.job_type || 'Part-time'}</span>
                    <span className="bg-surface-container text-on-surface-variant px-sm py-[2px] rounded text-label-sm">{formatJobSalary(job)}</span>
                </div>
                <Link
                    to={`/jobs/${job.id}`}
                    className="w-full inline-flex justify-center bg-primary text-on-primary py-md rounded-lg font-label-md hover:bg-primary-container transition-colors"
                >
                    Xem chi tiết
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <main className="max-w-container-max mx-auto px-gutter py-xl">
                <div className="rounded-xl bg-surface-container-lowest border border-outline-variant p-xl text-center text-on-surface-variant">
                    Đang tải thông tin hồ sơ...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="max-w-container-max mx-auto px-gutter py-xl">
                <div className="rounded-xl bg-surface-container-lowest border border-outline-variant p-xl text-center text-on-surface-variant text-error">
                    Lỗi: {error}
                </div>
            </main>
        );
    }

    const displayedName = formatField(profile.user_name);
    const displayedCity = formatField(profile.city);
    const displayedExperience = formatField(profile.experience);
    const displayedSalary = emptyValue(profile.expected_salary)
        ? 'Chưa cập nhật'
        : formatSalary(profile.expected_salary);
    const displayedFavoriteJobs = emptyValue(profile.favorite_jobs)
        ? []
        : profile.favorite_jobs;
    const displayedSkills = emptyValue(profile.skills)
        ? []
        : profile.skills;
    const displayedPhone = formatField(profile.phone || profile.phone_number || null);
    const displayedSocialLink = formatField(profile.social_link || profile.social || null);

    return (
        <main className="max-w-container-max mx-auto px-gutter py-xl">
            <section className="bg-surface-container-lowest rounded-xl p-2xl shadow-sm mb-xl border border-outline-variant relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-xl relative z-10">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-surface shadow-md">
                            <img
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTIVee-iR7p3lNuY0A1yon0b6EolEwxEvRAHzL_lsgqabaKxSqvJ0bRzA4XMviOfnJLbte0FT7nt_rFd_Lm3hQzggmTImX_WxW0MZymPr7hOzXb82lV7VtQlwIKTcKpdgGubGLoLWnVzoxh2XJWhJA-z5vuv9XTAXjLBCO_3peR4VFU5TWQ58GSQHdUKAelYu0gLFXK1vj7YWuZzuZL70gct7EIwy49U59JnL8TXnZUNmc8pGlLWsqeJ8KzN65HzD0L_HrkG7hduMu"
                            />
                        </div>
                        <button className="absolute bottom-2 right-2 bg-primary text-on-primary p-xs rounded-lg shadow-lg hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                        </button>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="font-display text-display text-on-surface mb-xs">{displayedName}</h1>
                        <p className="font-headline-sm text-on-surface-variant mb-sm">
                            {displayedFavoriteJobs.length === 0
                                ? 'Chưa cập nhật thông tin nghề nghiệp'
                                : displayedFavoriteJobs.join(', ')}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-md text-on-surface-variant font-label-md">
                            <span className="flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[20px]">location_on</span>
                                {displayedCity}
                            </span>
                            <span className="flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[20px]">work_history</span>
                                {displayedExperience}
                            </span>
                            <span className="flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[20px]">paid</span>
                                {displayedSalary}
                            </span>
                        </div>
                    </div>
                    <div className="mt-lg md:mt-0">
                        <button
                            type="button"
                            onClick={() => navigate('/update-profile')}
                            className="bg-primary text-on-primary font-label-md px-xl py-md rounded-xl shadow-sm hover:-translate-y-0.5 transition-all flex items-center gap-sm">
                            <span className="material-symbols-outlined">edit</span>
                            Chỉnh sửa hồ sơ
                        </button>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
                <aside className="lg:col-span-4 space-y-xl">
                    <div className="bg-surface-container-low rounded-xl p-lg border border-outline-variant shadow-sm">
                        <h3 className="font-headline-sm text-on-surface mb-lg">Thông tin liên hệ</h3>
                        <div className="space-y-md">
                            <div className="flex items-center gap-md">
                                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-outline-variant">
                                    <span className="material-symbols-outlined text-primary">mail</span>
                                </div>
                                <div>
                                    <p className="text-label-sm text-on-surface-variant">Email</p>
                                    <p className="font-label-md">{formatField(profile.email)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-md">
                                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-outline-variant">
                                    <span className="material-symbols-outlined text-primary">call</span>
                                </div>
                                <div>
                                    <p className="text-label-sm text-on-surface-variant">Số điện thoại</p>
                                    <p className="font-label-md">{displayedPhone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-md">
                                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-outline-variant">
                                    <span className="material-symbols-outlined text-primary">link</span>
                                </div>
                                <div>
                                    <p className="text-label-sm text-on-surface-variant">Social</p>
                                    <p className="font-label-md text-primary">{displayedSocialLink}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-low rounded-xl p-lg border border-outline-variant shadow-sm">
                        <div className="flex justify-between items-center mb-lg">
                            <h3 className="font-headline-sm text-on-surface">Kỹ năng</h3>
                            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
                                add_circle
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-sm">
                            {displayedSkills.length === 0 ? (
                                <span className="text-on-surface-variant">Chưa cập nhật</span>
                            ) : (
                                displayedSkills.map((skill, index) => (
                                    <span key={index} className="bg-primary-fixed text-on-primary-fixed px-md py-sm rounded-lg font-label-md">
                                        {skill}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-surface-container-low rounded-xl p-lg border border-outline-variant shadow-sm">
                        <h3 className="font-headline-sm text-on-surface mb-lg">Lĩnh vực quan tâm</h3>
                        <div className="flex flex-wrap gap-sm">
                            {displayedFavoriteJobs.length === 0 ? (
                                <span className="text-on-surface-variant">Chưa cập nhật</span>
                            ) : (
                                displayedFavoriteJobs.map((job, index) => (
                                    <span key={index} className="bg-surface text-secondary-fixed-dim border border-outline-variant px-md py-sm rounded-lg font-label-md text-on-surface">
                                        {job}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                <div className="lg:col-span-8">
                    <div className="flex border-b border-outline-variant mb-lg gap-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <button
                            type="button"
                            onClick={() => setActiveTab('saved')}
                            className={`pb-md px-xs font-label-md ${activeTab === 'saved' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary transition-colors'}`}>
                            Công việc đã lưu
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('applied')}
                            className={`pb-md px-xs font-label-md ${activeTab === 'applied' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary transition-colors'}`}>
                            Công việc đã ứng tuyển
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('recent')}
                            className={`pb-md px-xs font-label-md ${activeTab === 'recent' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary transition-colors'}`}>
                            Hoạt động gần đây
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                        {activeTab === 'recent' ? (
                            <div className="lg:col-span-2 rounded-xl bg-surface-container-lowest border border-outline-variant p-md">
                                <h3 className="font-headline-sm px-md py-sm border-b border-outline-variant text-on-surface mb-md">Vết hoạt động của bạn</h3>
                                
                                {recentActivities.length === 0 ? (
                                    <div className="p-xl text-center text-on-surface-variant">Bạn chưa có hoạt động nào gần đây.</div>
                                ) : (
                                    /* Hộp chứa có thanh cuộn dọc, giới hạn chiều cao */
                                    <ul className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {recentActivities.map(act => (
                                            <li key={act.id} className="p-md hover:bg-surface-container-low rounded-lg transition-colors border border-transparent hover:border-outline-variant">
                                                <div className="flex justify-between items-start gap-md">
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container-high px-2 py-1 rounded mb-2 inline-block">
                                                            {act.type === 'view' ? 'Xem tin' : act.type === 'save' ? 'Lưu việc' : act.type === 'unsave' ? 'Bỏ lưu' : act.type === 'apply' ? 'Ứng tuyển' : 'Tìm kiếm'}
                                                        </span>
                                                        <Link to={act.link || "#"} className="block font-label-md text-on-surface hover:text-primary transition-colors">
                                                            {act.title}
                                                        </Link>
                                                    </div>
                                                    <span className="text-body-sm text-on-surface-variant whitespace-nowrap">
                                                        {new Date(act.timestamp).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ) : (activeTab === 'saved' ? loadingSavedJobs : loadingAppliedJobs) ? (
                            <div className="lg:col-span-2 rounded-xl bg-surface-container-lowest border border-outline-variant p-xl text-center text-on-surface-variant">
                                Đang tải danh sách công việc...
                            </div>
                        ) : jobsError ? (
                            <div className="lg:col-span-2 rounded-xl bg-surface-container-lowest border border-outline-variant p-xl text-center text-error">
                                Lỗi: {jobsError}
                            </div>
                        ) : (activeTab === 'saved' ? savedJobs : appliedJobs).length === 0 ? (
                            <div className="lg:col-span-2 rounded-xl bg-surface-container-lowest border border-outline-variant p-xl text-center text-on-surface-variant">
                                {activeTab === 'saved' ? 'Bạn chưa có công việc đã lưu.' : 'Bạn chưa có công việc đã ứng tuyển.'}
                            </div>
                        ) : (
                            (activeTab === 'saved' ? savedJobs : appliedJobs).map(renderJobCard)
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}