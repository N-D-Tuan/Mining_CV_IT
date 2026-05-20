import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

export default function Home() {
    const [recentActivities, setRecentActivities] = useState([]);

    const [appliedCount, setAppliedCount] = useState(0);
    const [savedCount, setSavedCount] = useState(0);

    useEffect(() => {
        // Đọc từ localStorage và chỉ lấy 3 hoạt động mới nhất cho trang chủ
        const stored = JSON.parse(localStorage.getItem("recentActivities") || "[]");
        setRecentActivities(stored.slice(0, 3));

        // 1. Lấy số lượng đã ứng tuyển
        fetch(`${API_BASE}/api/v1/users/applied-jobs`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    // Ưu tiên lấy biến total từ API, nếu không có thì lấy độ dài mảng items
                    setAppliedCount(data.data.total || data.data.items?.length || 0);
                }
            })
            .catch(err => console.log("Lỗi tải ứng tuyển:", err));

        // 2. Lấy số lượng đã lưu
        fetch(`${API_BASE}/api/v1/users/saved-jobs`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.data) {
                    setSavedCount(data.data.total || data.data.items?.length || 0);
                }
            })
            .catch(err => console.log("Lỗi tải đã lưu:", err));
    }, []);

    // Hàm chọn màu và icon tùy theo loại hoạt động
    const getActivityStyle = (type) => {
        switch (type) {
            case 'apply': return { icon: 'send', bg: 'bg-primary text-on-primary' };
            case 'save': return { icon: 'bookmark', bg: 'bg-secondary text-on-secondary' };
            case 'unsave': return { icon: 'bookmark_remove', bg: 'bg-error text-on-error' };
            case 'search': return { icon: 'search', bg: 'bg-tertiary text-on-tertiary' };
            case 'view': return { icon: 'visibility', bg: 'bg-outline-variant text-on-surface' };
            default: return { icon: 'history', bg: 'bg-surface-container-high text-on-surface' };
        }
    };

    // Hàm format thời gian đẹp
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <div className="p-gutter max-w-container-max mx-auto space-y-xl">
                {/* <!-- Statistic Cards Grid --> */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
                    {/* <!-- Stat Card 1 --> */}
                    <div
                        className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-md">
                            <div className="p-sm bg-primary-fixed rounded-lg text-primary">
                                <span className="material-symbols-outlined">send</span>
                            </div>
                            <span className="text-green-600 font-label-sm flex items-center gap-xs">+12% <span
                                    className="material-symbols-outlined text-[14px]">trending_up</span></span>
                        </div>
                        <h3 className="font-body-sm text-on-surface-variant">Tổng công việc đã ứng tuyển</h3>
                        <p className="font-display text-headline-md mt-xs">{appliedCount}</p>
                    </div>
                    {/* <!-- Stat Card 2 --> */}
                    <div
                        className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-md">
                            <div className="p-sm bg-secondary-fixed rounded-lg text-secondary">
                                <span className="material-symbols-outlined">bookmark</span>
                            </div>
                            <span className="text-on-surface-variant font-label-sm">Ổn định</span>
                        </div>
                        <h3 className="font-body-sm text-on-surface-variant">Công việc đã lưu</h3>
                        <p className="font-display text-headline-md mt-xs">{savedCount}</p>
                    </div>
                    {/* <!-- Stat Card 3 --> */}
                    <div
                        className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-md">
                            <div className="p-sm bg-tertiary-fixed rounded-lg text-tertiary">
                                <span className="material-symbols-outlined">visibility</span>
                            </div>
                            <span className="text-green-600 font-label-sm flex items-center gap-xs">+5% <span
                                    className="material-symbols-outlined text-[14px]">trending_up</span></span>
                        </div>
                        <h3 className="font-body-sm text-on-surface-variant">Lượt xem hồ sơ</h3>
                        <p className="font-display text-headline-md mt-xs">342</p>
                    </div>
                    {/* <!-- Stat Card 4 --> */}
                    <div
                        className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-md">
                            <div className="p-sm bg-error-container rounded-lg text-on-error-container">
                                <span className="material-symbols-outlined">bolt</span>
                            </div>
                            <span className="text-primary font-label-sm">Rất tốt</span>
                        </div>
                        <h3 className="font-body-sm text-on-surface-variant">Tỷ lệ phản hồi</h3>
                        <p className="font-display text-headline-md mt-xs">88%</p>
                    </div>
                </div>
                {/* <!-- Bento Grid Content --> */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
                    {/* <!-- Chart Section (Bar Chart Simulation) --> */}
                    <div
                        className="lg:col-span-8 bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
                        <div className="flex justify-between items-center mb-xl">
                            <h2 className="font-headline-sm">Hoạt động tìm việc trong 30 ngày qua</h2>
                            <div className="flex gap-sm">
                                <button
                                    className="px-md py-xs rounded-full border border-outline-variant font-label-sm hover:bg-surface-container-low">Tháng
                                    này</button>
                                <button
                                    className="px-md py-xs rounded-full bg-primary-container text-on-primary-container font-label-sm">30
                                    ngày qua</button>
                            </div>
                        </div>
                        {/* <!-- Bar Chart Viz --> */}
                        <div className="flex items-end justify-between h-48 gap-xs">
                            <div
                                className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[40%]">
                            </div>
                            <div
                                className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[60%]">
                            </div>
                            <div
                                className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[35%]">
                            </div>
                            <div
                                className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[80%]">
                            </div>
                            <div className="w-full bg-primary-container rounded-t-lg h-[95%]"></div>
                            <div
                                className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[55%]">
                            </div>
                            <div
                                className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[70%]">
                            </div>
                            <div
                                className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[45%]">
                            </div>
                            <div
                                className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[30%]">
                            </div>
                            <div
                                className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[85%]">
                            </div>
                            <div
                                className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[40%]">
                            </div>
                            <div
                                className="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[50%]">
                            </div>
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
                                <div classNameName="text-on-surface-variant text-body-sm pl-8">Chưa có hoạt động nào.</div>
                            ) : (
                                recentActivities.map((act) => {
                                    const style = getActivityStyle(act.type);
                                    return (
                                        <div key={act.id} classNameName="relative flex gap-md items-start group">
                                            <div classNameName={`w-6 h-6 rounded-full ${style.bg} flex items-center justify-center z-10 shrink-0 shadow-sm`}>
                                                <span classNameName="material-symbols-outlined text-[14px]">{style.icon}</span>
                                            </div>
                                            <div classNameName="flex flex-col">
                                                <Link to={act.link || "#"} classNameName="font-label-md text-on-surface hover:text-primary transition-colors line-clamp-1">
                                                    {act.title}
                                                </Link>
                                                <span classNameName="font-body-sm text-on-surface-variant">{formatTime(act.timestamp)}</span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                        <Link to="/profile" state={{ tab: 'recent' }} classNameName="mt-xl text-primary font-label-md hover:underline text-left block">Xem tất cả trong Hồ sơ</Link>
                    </div>
                    {/* <!-- Recommended Carousel Section --> */}
                    <div className="lg:col-span-12">
                        <div className="flex items-center justify-between mb-lg">
                            <h2 className="font-headline-sm">Gợi ý việc làm cho bạn</h2>
                            <div className="flex gap-sm">
                                <button
                                    className="p-xs rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button
                                    className="p-xs rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                            {/* <!-- Recommended Card 1 --> */}
                            <div
                                className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:scale-[1.01] transition-transform cursor-pointer group">
                                <div className="flex items-start justify-between mb-md">
                                    <img alt="Company Logo" className="w-12 h-12 rounded-lg object-cover"
                                        data-alt="A minimalist tech company logo featuring abstract geometric shapes in vibrant blue and white. The aesthetic is clean, modern, and professional, representative of a cutting-edge creative agency or startup. High-resolution digital art style."
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZknfDIJreikvfv_JR6d6oAkcqMA7GkzBkVfcMyiYcWJDU-nBbbtuS1VlgD9x85evDaYWNJrC8cqsblhhzX5L7unvTx6WzFv1HKQkNxec4j9FZRB0u51nSDxjfmFr01CPkSbH4IijEUNvDnHq7MljsXO7l1klIbLjRwaidCW2zSObYa6mQKPPzMcQ2W8ZKrNPF2LdsIKI9dxXzqiqtpehxlU30lfrzRXGTUduGBtvMUQLp_DG1AQJZHyBfYgOmfI7V9UTk522Hmicv" />
                                    <span
                                        className="bg-surface-container-high px-sm py-xs rounded-full font-label-sm text-on-surface-variant">Freelance</span>
                                </div>
                                <h4 className="font-headline-sm mb-xs group-hover:text-primary transition-colors">UI/UX
                                    Product Designer</h4>
                                <p className="font-body-sm text-on-surface-variant mb-md">Creative Mind Agency • Quận 1,
                                    TP.HCM</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-label-md text-primary">15tr - 20tr VNĐ</span>
                                    <button
                                        className="bg-secondary-container text-on-secondary-container px-md py-xs rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors">Chi
                                        tiết</button>
                                </div>
                            </div>
                            {/* <!-- Recommended Card 2 --> */}
                            <div
                                className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:scale-[1.01] transition-transform cursor-pointer group">
                                <div className="flex items-start justify-between mb-md">
                                    <img alt="Company Logo" className="w-12 h-12 rounded-lg object-cover"
                                        data-alt="A premium food and beverage brand logo with elegant, warm tones. The design features a stylized coffee bean or cup in deep brown and gold accents, evoking a sense of high-quality hospitality and comfort. Modern corporate branding for a premium cafe chain."
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd6fr3K6d3CoXlAccDlBsp94kZE_chWVsKvRKAoScn-onmkrj5TIgdLWJf6xpw-TwXR0Yx0jBv5FQns8tf7vqGD5lEig31LwXBkBRIpP1aBhncdotSpkpKWFmZqzbmihg0KURkl7UByrsZ4bc2C_Vk3dwA6MwzguDbOPsHdFmKuu_lQfqP1DCCuX-_Og3WmFYUt8NZh1v9jqjlsAJT79kggAVLvetB51pRPw5WmJ1uDAZTjOXU4YZMpjAXgFfMKRv0Znf6ZNqgcY_7" />
                                    <span
                                        className="bg-surface-container-high px-sm py-xs rounded-full font-label-sm text-on-surface-variant">Part-time</span>
                                </div>
                                <h4 className="font-headline-sm mb-xs group-hover:text-primary transition-colors">Barista
                                    Senior</h4>
                                <p className="font-body-sm text-on-surface-variant mb-md">The Coffee House • Quận 3, TP.HCM
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="font-label-md text-primary">35k - 45k/giờ</span>
                                    <button
                                        className="bg-secondary-container text-on-secondary-container px-md py-xs rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors">Chi
                                        tiết</button>
                                </div>
                            </div>
                            {/* <!-- Recommended Card 3 --> */}
                            <div
                                className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:scale-[1.01] transition-transform cursor-pointer group">
                                <div className="flex items-start justify-between mb-md">
                                    <img alt="Company Logo" className="w-12 h-12 rounded-lg object-cover"
                                        data-alt="A clean corporate logo for a modern educational institution or tutoring center. The logo uses blue and grey tones with a book or graduation cap icon integrated into the brand name. The style is professional, trustworthy, and academic."
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEZ5UPQQaCs9rcWiE1bkQPN1YdlIxRM1Fab3E0iuZ81cQk1lwdlGoSxfn91q_iGrBvePrCZDq1efxfem-YtLWrOeBDCTsNmaj8V57uQN3cLLQecwz93R-R8NxRas22zfiCNmc6jmOHM3THNars-DcagPmy8937YP79hC4kyOKZVzHUegJWpG8bS7LJ6c34_imTRdzkPzdFfQi75WWCVqtNu7DNsZK22GieAfUUP9lx_vYCMTHarUW99C9fpsFZkGM1l4gG0q_sKNMm" />
                                    <span
                                        className="bg-surface-container-high px-sm py-xs rounded-full font-label-sm text-on-surface-variant">Freelance</span>
                                </div>
                                <h4 className="font-headline-sm mb-xs group-hover:text-primary transition-colors">Gia sư
                                    Tiếng Anh (IELTS)</h4>
                                <p className="font-body-sm text-on-surface-variant mb-md">EduGrowth Center • Online / Thủ
                                    Đức</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-label-md text-primary">250k - 400k/giờ</span>
                                    <button
                                        className="bg-secondary-container text-on-secondary-container px-md py-xs rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors">Chi
                                        tiết</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}