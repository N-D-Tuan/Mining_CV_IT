import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { useState, useEffect, useRef } from "react";

export default function Header() {
    // Để chuyển trang
    const navigate = useNavigate(); 

    // === 1. KHỞI TẠO STATE & ĐỌC LOCAL STORAGE ===
    const [notifications, setNotifications] = useState(() => {
        const savedNotifs = localStorage.getItem("jobNotifications");
        return savedNotifs ? JSON.parse(savedNotifs) : [];
    });
    
    // Đếm số lượng thông báo chưa đọc
    const [unreadCount, setUnreadCount] = useState(() => {
        const savedNotifs = localStorage.getItem("jobNotifications");
        if (savedNotifs) {
            const parsedNotifs = JSON.parse(savedNotifs);
            return parsedNotifs.filter(n => !n.is_seen).length;
        }
        return 0;
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Lưu notifications vào localStorage mỗi khi state thay đổi
    useEffect(() => {
        localStorage.setItem("jobNotifications", JSON.stringify(notifications));
        
        // Tự động tính lại số lượng chưa đọc mỗi khi mảng bị cập nhật
        setUnreadCount(notifications.filter(n => !n.is_seen).length);
    }, [notifications]);

    // === 2. KẾT NỐI WEBSOCKET ===
    useEffect(() => {
        const ws = new WebSocket("ws://127.0.0.1:8000/ws/notifications");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === "NEW_JOB_ALERT") {
                const now = new Date();
                const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
                
                const newNotif = {
                    id: Date.now() + Math.random(),
                    title: data.title, 
                    job_id: data.job_id, 
                    time: timeString,
                    is_seen: false // Thông báo mới luôn là chưa đọc
                };
                
                setNotifications(prev => [newNotif, ...prev]);
            }
        };

        return () => ws.close();
    }, []);

    // === 3. XỬ LÝ ĐÓNG DROP-DOWN KHI CLICK RA NGOÀI ===
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // === 4. XỬ LÝ SỰ KIỆN CLICK ===
    
    // Nút mở/đóng chuông (Bỏ logic tự động đánh dấu đã đọc tại đây)
    const handleBellClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Khi click vào 1 thông báo cụ thể
    const handleNotificationClick = (notifId, jobId) => {
        // 1. Đánh dấu thông báo này là đã đọc
        setNotifications(prevNotifs => 
            prevNotifs.map(notif => 
                notif.id === notifId ? { ...notif, is_seen: true } : notif
            )
        );

        // 2. Tùy chọn: Đóng khung thông báo lại cho gọn
        setIsDropdownOpen(false);

        // 3. Chuyển hướng sang trang chi tiết công việc
        navigate(`/jobs/${jobId}`);
    };

    return (
        <>
            <header className="bg-surface dark:bg-surface-dim docked full-width top-0 sticky z-50 border-b border-outline-variant dark:border-outline shadow-sm h-[64px]">
                <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-full">
                    <div className="flex items-center gap-xl">
                        <Link to="/">
                            <span className="font-display text-headline-md font-bold text-primary dark:text-primary-fixed-dim">JobFlow</span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-lg">
                            <Link to="/browse">
                                <span className="text-on-surface-variant dark:text-on-surface-variant font-medium font-headline-sm text-headline-sm hover:text-primary-container transition-all">Browse</span>
                            </Link>
                            <Link to="/">
                                <span className="text-on-surface-variant dark:text-on-surface-variant font-medium font-headline-sm text-headline-sm hover:text-primary-container transition-all">Dashboard</span>
                            </Link>
                            <Link to="/profile">
                                <span className="text-on-surface-variant dark:text-on-surface-variant font-medium font-headline-sm text-headline-sm hover:text-primary-container transition-all">Profile</span>
                            </Link>
                        </nav>
                    </div>
                    
                    <div className="flex items-center gap-md">
                        {/* VÙNG NÚT CHUÔNG */}
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={handleBellClick}
                                className="relative p-sm text-on-surface-variant hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined">notifications</span>
                                
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-dim border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
                                    <div className="p-4 border-b border-outline-variant flex justify-between items-center">
                                        <h3 className="font-bold text-on-surface">Thông báo của bạn</h3>
                                        
                                        {/* Nút nhỏ: Đánh dấu tất cả là đã đọc (Tùy chọn) */}
                                        {unreadCount > 0 && (
                                            <button 
                                                onClick={() => {
                                                    setNotifications(prev => prev.map(n => ({...n, is_seen: true})));
                                                }}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Đánh dấu đã đọc
                                            </button>
                                        )}
                                    </div>
                                    <ul className="max-h-[60vh] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <li className="p-4 text-center text-on-surface-variant text-sm">
                                                Chưa có thông báo nào
                                            </li>
                                        ) : (
                                            notifications.map(notif => (
                                                <li 
                                                    key={notif.id} 
                                                    onClick={() => handleNotificationClick(notif.id, notif.job_id)} // <-- SỰ KIỆN CLICK TẠI ĐÂY
                                                    className={`cursor-pointer p-4 border-b border-outline-variant transition-colors ${
                                                        !notif.is_seen 
                                                            ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100' 
                                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    <div className="text-sm text-on-surface">
                                                        {!notif.is_seen && (
                                                            <span className="text-primary font-bold mr-2">● Mới</span>
                                                        )}
                                                        Đã phát hiện job mới với tiêu đề '<b className="text-on-surface-variant">{notif.title}</b>'!
                                                    </div>
                                                    <div className="text-xs text-on-surface-variant mt-2 flex justify-between">
                                                        <span>Lúc {notif.time}</span>
                                                    </div>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {/* KẾT THÚC VÙNG NÚT CHUÔNG */}

                        <button className="p-sm text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                        <div className="h-10 w-10 rounded-full overflow-hidden border border-outline-variant">
                            <Link to="/profile">
                                <img alt="User profile"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCArYmU7Q68etRKOwGnvYoBMN4qsrdHwhnoRvQWQpSgMmK7_BsggJn6urIO8NrnGj9iQndC8Zz44Sr9vYjxlcmxa-o-LvCFK7TiBciroLIBqwqBbR68oVH2S7_brpYRYLOO6xF2uW6wkQ9Paf3mrmfObXgLla2huxdiMSTa1XPQE7CoWrG0Wr-6s5uAOZPpo7COHgp1JnS9Vn577USsjiLVvCzKX7X-iq3BB8BljOJ4VqHzqOkYBnpSHbWl9p7eeHECgCHqxop1vrFS" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}