import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

export default function Update_Profile() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [city, setCity] = useState('');
    const [expectedSalary, setExpectedSalary] = useState('');
    const [experience, setExperience] = useState('');
    const [favoriteJobs, setFavoriteJobs] = useState('');
    const [skills, setSkills] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [hasProfile, setHasProfile] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/users/profile`, {
                method: 'GET',
                credentials: 'include',
            });
            const body = await res.json();
            if (!res.ok) {
                throw new Error(body.detail || body.message || 'Không thể tải profile');
            }
            const data = body.data || {};
            setCity(data.city || '');
            setExpectedSalary(data.expected_salary?.toString() || '');
            setExperience(data.experience || '');
            setFavoriteJobs((data.favorite_jobs || []).join(', '));
            setSkills((data.skills || []).join(', '));
            setHasProfile(
                Boolean(data.has_profile) ||
                Boolean(data.city) ||
                Boolean(data.expected_salary) ||
                Boolean(data.experience) ||
                Boolean(data.favorite_jobs?.length) ||
                Boolean(data.skills?.length)
            );
        } catch (err) {
            setError(String(err));
        } finally {
            setIsLoading(false);
        }
    }

    function parseList(value) {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function buildPayload() {
        const payload = {};
        if (city.trim()) payload.city = city.trim();
        if (expectedSalary.trim()) payload.expected_salary = Number(expectedSalary);
        if (experience.trim()) payload.experience = experience.trim();
        const fav = parseList(favoriteJobs);
        if (fav.length) payload.favorite_jobs = fav;
        const skillList = parseList(skills);
        if (skillList.length) payload.skills = skillList;
        return payload;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);
        try {
            const payload = buildPayload();
            const method = hasProfile ? 'PUT' : 'POST';
            const res = await fetch(`${API_BASE}/api/v1/users/profile`, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const body = await res.json();
            if (!res.ok) {
                throw new Error(body.detail || body.message || 'Cập nhật hồ sơ thất bại');
            }
            setHasProfile(true);
            setSuccess('Thông tin hồ sơ đã được lưu.');
            setTimeout(() => navigate('/profile'), 1200);
        } catch (err) {
            setError(String(err));
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <main className="flex-grow flex flex-col items-center justify-center py-2xl px-gutter">
                <div className="text-on-surface-variant">Đang tải thông tin hồ sơ...</div>
            </main>
        );
    }

    return (
        <main className="flex-grow flex flex-col items-center justify-center py-2xl px-gutter">
            <div className="w-full max-w-[720px]">
                <div className="text-center mb-xl">
                    <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Hoàn thiện hồ sơ cá nhân</h1>
                    <p className="font-body-md text-on-surface-variant">Điền thông tin dưới đây để JobFlow kết nối bạn với công việc phù hợp.</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-md mb-xl shadow-sm border border-outline-variant/30">
                    <div className="flex flex-col md:flex-row gap-3">
                        {['Thông tin cơ bản', 'Kỹ năng & Kinh nghiệm', 'Mong muốn công việc'].map((label, index) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => setActiveTab(index)}
                                className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${activeTab === index ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-xl shadow-sm border border-outline-variant">
                    <form className="space-y-xl" onSubmit={handleSubmit}>
                        {error && <div className="text-red-600">{error}</div>}
                        {success && <div className="text-green-600">{success}</div>}

                        {activeTab === 0 && (
                            <div className="space-y-xl">
                                <div className="space-y-xs">
                                    <label className="font-label-md text-on-surface">Thành phố hiện tại</label>
                                    <div className="relative">
                                        <span className="absolute left-md top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">location_on</span>
                                        <input
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full h-[48px] pl-[48px] bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            placeholder="Hồ Chí Minh" />
                                    </div>
                                </div>
                                <div className="space-y-xs">
                                    <label className="font-label-md text-on-surface">Mức lương mong muốn</label>
                                    <div className="relative">
                                        <span className="absolute left-md top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">paid</span>
                                        <input
                                            value={expectedSalary}
                                            onChange={(e) => setExpectedSalary(e.target.value)}
                                            className="w-full h-[48px] pl-[48px] bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            placeholder="Ví dụ: 7000000"
                                            type="number"
                                            min="0" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 1 && (
                            <div className="space-y-xl">
                                <div className="space-y-xs">
                                    <label className="font-label-md text-on-surface">Kinh nghiệm</label>
                                    <textarea
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                        rows={5}
                                        className="w-full px-md py-sm bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="Mô tả ngắn gọn về kinh nghiệm của bạn"></textarea>
                                </div>
                                <div className="space-y-xs">
                                    <label className="font-label-md text-on-surface">Kỹ năng</label>
                                    <input
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                        className="w-full h-[48px] px-md bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="VD: Marketing, Excel, Tiếng Anh" />
                                    <p className="text-body-sm text-on-surface-variant">Ngăn cách bằng dấu phẩy</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 2 && (
                            <div className="space-y-xl">
                                <div className="space-y-xs">
                                    <label className="font-label-md text-on-surface">Công việc / vai trò mong muốn</label>
                                    <input
                                        value={favoriteJobs}
                                        onChange={(e) => setFavoriteJobs(e.target.value)}
                                        className="w-full h-[48px] px-md bg-surface-bright border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="VD: Content writer, Social media manager" />
                                    <p className="text-body-sm text-on-surface-variant">Ngăn cách bằng dấu phẩy</p>
                                </div>
                                <div className="space-y-xs">
                                    <label className="font-label-md text-on-surface">Trạng thái hồ sơ</label>
                                    <p className="text-body-sm text-on-surface-variant">Thông tin này sẽ giúp hệ thống hiểu rõ mục tiêu nghề nghiệp của bạn.</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-md">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary hover:bg-primary-container text-on-primary font-headline-sm h-[56px] rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-sm">
                                {isSubmitting ? 'Đang lưu...' : hasProfile ? 'Cập nhật hồ sơ' : 'Lưu hồ sơ'}
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <p className="text-center mt-md font-body-sm text-on-surface-variant italic">Bạn có thể thay đổi các thông tin này sau trong phần Profile.</p>
                        </div>
                    </form>
                </div>
                <div className="mt-xl flex flex-col md:flex-row gap-lg items-center bg-secondary-container/30 p-lg rounded-xl border border-secondary-fixed/50">
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <img alt="Support Specialist" className="w-full h-full object-cover rounded-full shadow-sm"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1ZJgJE5e66frpuhWdSFExa8cBJaDEDipXwkHIOSUetX9AxR8xZuBTdwXu8_6K9a6cJnfM-KWl-22kfPcm88vICew4gS1CsLV3jrIxjEMiWIoRCHk4kYXTLHLQ692rVyAP3PgXi9xjw9k-_Y7iBw4BK8FiNcwyzXEnPk_OpT-iz_OqjI02NNKRGln2x3cu4tP9RR849AqwfqvxLpp_in-5isUt-5DV-eLxMCtX2gZhtr6maTOsQ4BHH2EpOaTa_Ir8NDK8y_xTN4rR" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-headline-sm text-on-secondary-container">Cần hỗ trợ?</h3>
                        <p className="font-body-sm text-on-secondary-container/80">Nếu bạn cần trợ giúp khi cập nhật hồ sơ, hãy liên hệ đội ngũ hỗ trợ của chúng tôi.</p>
                        <button type="button" onClick={() => navigate('/profile')} className="mt-xs font-label-md text-primary hover:underline">Trở về trang profile</button>
                    </div>
                </div>
            </div>
        </main>
    );
}
