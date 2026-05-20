import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

// Thêm cấu hình API_BASE
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Profile", path: "/profile" },
  { label: "Jobs", path: "/jobs" },
  { label: "Map", path: "/map" },
];

export default function Header() {
  const navigate = useNavigate();

  // === STATE CHO THÔNG BÁO ===
  const [notifications, setNotifications] = useState(() => {
    const savedNotifs = localStorage.getItem("jobNotifications");
    return savedNotifs ? JSON.parse(savedNotifs) : [];
  });

  const [unreadCount, setUnreadCount] = useState(() => {
    const savedNotifs = localStorage.getItem("jobNotifications");
    if (savedNotifs) {
      const parsedNotifs = JSON.parse(savedNotifs);
      return parsedNotifs.filter((n) => !n.is_seen).length;
    }
    return 0;
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // === STATE CHO SETTINGS (ĐĂNG NHẬP / ĐĂNG XUẤT) ===
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  // Kiểm tra xem người dùng đã đăng nhập chưa (Dựa vào dữ liệu user lưu trong localStorage)
  // Lưu ý: Nếu ở Login.js bạn lưu tên key khác thì nhớ đổi lại chữ "user" cho khớp nhé
  const isLoggedIn = !!localStorage.getItem("user");

  useEffect(() => {
    localStorage.setItem("jobNotifications", JSON.stringify(notifications));
    setUnreadCount(notifications.filter((n) => !n.is_seen).length);
  }, [notifications]);

  // === KẾT NỐI WEBSOCKET ===
  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/notifications");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_JOB_ALERT") {
        const now = new Date();
        const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
        const newNotif = {
          id: Date.now() + Math.random(),
          title: data.title,
          job_id: data.job_id,
          time: timeString,
          is_seen: false,
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    };

    return () => ws.close();
  }, []);

  // === XỬ LÝ ĐÓNG DROP-DOWN KHI CLICK RA NGOÀI (Cho cả Chuông và Settings) ===
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsSettingsOpen(false); // Đóng settings nếu đang mở
  };

  const handleNotificationClick = (notifId, jobId) => {
    setNotifications((prevNotifs) =>
      prevNotifs.map((notif) =>
        notif.id === notifId ? { ...notif, is_seen: true } : notif,
      ),
    );
    setIsDropdownOpen(false);
    navigate(`/jobs/${jobId}`);
  };

  // === HÀM XỬ LÝ LOGOUT GỌI API ===
  const handleLogout = async () => {
    try {
      // Gọi API logout để backend xóa Cookie
      await fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Lỗi khi gọi API đăng xuất:", error);
    } finally {
      // Dọn dẹp rác trên LocalStorage
      localStorage.removeItem("user");
      localStorage.removeItem("jobNotifications");
      localStorage.removeItem("recentActivities");

      setIsSettingsOpen(false);

      // F5 lại trang và đá về trang login (Dùng window.location để reset toàn bộ State React)
      window.location.href = "/";
    }
  };

  return (
    <>
      <header className="bg-surface dark:bg-surface-dim docked full-width top-0 sticky z-[100] border-b border-outline-variant dark:border-outline shadow-sm h-[64px]">
        <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-full">
          <div className="flex items-center gap-xl">
            <Link to="/">
              <span className="font-display text-headline-md font-bold text-primary dark:text-primary-fixed-dim">
                JobFlow
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-lg">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `
          text-[16px]
          font-medium
          transition-colors
          duration-200
          hover:text-primary
          ${isActive ? "text-primary" : "text-on-surface-variant"}
        `
                  }
                >
                  {item.label}
                </NavLink>
              ))}
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
                  {/* ... Code UI danh sách thông báo giữ nguyên ... */}
                  <div className="p-4 border-b border-outline-variant flex justify-between items-center">
                    <h3 className="font-bold text-on-surface">
                      Thông báo của bạn
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, is_seen: true })),
                          )
                        }
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
                      notifications.map((notif) => (
                        <li
                          key={notif.id}
                          onClick={() =>
                            handleNotificationClick(notif.id, notif.job_id)
                          }
                          className={`cursor-pointer p-4 border-b border-outline-variant transition-colors ${!notif.is_seen ? "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                        >
                          <div className="text-sm text-on-surface">
                            {!notif.is_seen && (
                              <span className="text-primary font-bold mr-2">
                                ● Mới
                              </span>
                            )}
                            Đã phát hiện job mới với tiêu đề '
                            <b className="text-on-surface-variant">
                              {notif.title}
                            </b>
                            '!
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

            {/* VÙNG NÚT SETTINGS (ĐĂNG NHẬP / ĐĂNG XUẤT) */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setIsDropdownOpen(false); // Đóng chuông nếu đang mở
                }}
                className="p-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">settings</span>
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dim border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50 py-2">
                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 font-medium"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        logout
                      </span>
                      Đăng xuất
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        navigate("/login");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        login
                      </span>
                      Đăng nhập
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* KẾT THÚC VÙNG NÚT SETTINGS */}

            <div className="h-10 w-10 rounded-full overflow-hidden border border-outline-variant">
              <Link to="/profile">
                <img
                  alt="User profile"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCArYmU7Q68etRKOwGnvYoBMN4qsrdHwhnoRvQWQpSgMmK7_BsggJn6urIO8NrnGj9iQndC8Zz44Sr9vYjxlcmxa-o-LvCFK7TiBciroLIBqwqBbR68oVH2S7_brpYRYLOO6xF2uW6wkQ9Paf3mrmfObXgLla2huxdiMSTa1XPQE7CoWrG0Wr-6s5uAOZPpo7COHgp1JnS9Vn577USsjiLVvCzKX7X-iq3BB8BljOJ4VqHzqOkYBnpSHbWl9p7eeHECgCHqxop1vrFS"
                />
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
