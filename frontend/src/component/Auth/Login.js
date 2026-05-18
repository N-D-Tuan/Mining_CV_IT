import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';

export default function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [mode, setMode] = useState('login'); // 'login' | 'register'

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

    async function handleLogin(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });
            const body = await res.json();
            console.log('Login response', res.status, res.url, body);
            if (!res.ok) {
                setError(body.detail || body.message || 'Đăng nhập thất bại');
                setLoading(false);
                return;
            }
            setUser(body.data || null);
            const profileRes = await fetch(`${API_BASE}/api/v1/users/profile`, {
                method: 'GET',
                credentials: 'include',
            });
            if (profileRes.ok) {
                const profileBody = await profileRes.json();
                const profileData = profileBody.data || {};
                setLoading(false);
                navigate(profileData.has_profile === false ? '/update-profile' : '/');
                return;
            }
            setLoading(false);
            navigate('/update-profile');
        } catch (err) {
            console.error('Login error', err);
            setError(String(err));
            setLoading(false);
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
                credentials: 'include',
            });
            const body = await res.json();
            console.log('Register response', res.status, res.url, body);
            if (!res.ok) {
                setError(body.detail || body.message || 'Đăng ký thất bại');
                setLoading(false);
                return;
            }
            setUser(body.data || null);
            const profileRes = await fetch(`${API_BASE}/api/v1/users/profile`, {
                method: 'GET',
                credentials: 'include',
            });
            if (profileRes.ok) {
                const profileBody = await profileRes.json();
                const profileData = profileBody.data || {};
                setLoading(false);
                navigate(profileData.has_profile === false ? '/update-profile' : '/');
                return;
            }
            setLoading(false);
            navigate('/update-profile');
        } catch (err) {
            console.error('Register error', err);
            setError(String(err));
            setLoading(false);
        }
    }

    return (
        <>
            <main className="flex-grow flex items-center justify-center p-md md:p-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl max-w-container-max w-full mx-auto items-center">
                    <div className="hidden lg:flex flex-col gap-lg pr-xl">
                        <div className="flex items-center gap-sm">
                            <span className="material-symbols-outlined text-primary text-[48px]" data-icon="work">work</span>
                            <h1 className="font-display text-display text-primary">JobFlow</h1>
                        </div>
                        <h2 className="font-headline-lg text-headline-lg text-on-surface">Kết nối ước mơ, <br /><span
                            className="text-primary-container">kiến tạo tương lai.</span></h2>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                            Nền tảng tìm kiếm việc làm bán thời gian hàng đầu dành cho sinh viên và người làm tự do. Đơn giản,
                            nhanh chóng và hiệu quả.
                        </p>
                        <div className="grid grid-cols-2 gap-md mt-xl">
                            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant">
                                <span className="material-symbols-outlined text-primary mb-sm"
                                    data-icon="verified_user">verified_user</span>
                                <p className="font-label-md text-label-md text-on-surface">Tin cậy &amp; Bảo mật</p>
                            </div>
                            <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant">
                                <span className="material-symbols-outlined text-primary mb-sm" data-icon="bolt">bolt</span>
                                <p className="font-label-md text-label-md text-on-surface">Ứng tuyển nhanh</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex justify-center lg:justify-end">
                        <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant p-xl flex flex-col gap-xl">
                            <div className="text-center lg:text-left">
                                <div className="lg:hidden flex justify-center items-center gap-xs mb-md">
                                    <span className="material-symbols-outlined text-primary" data-icon="work">work</span>
                                    <span className="font-display text-headline-md font-bold text-primary">JobFlow</span>
                                </div>
                                <div className="flex gap-2 justify-center lg:justify-start mb-md">
                                    <button type="button" onClick={() => { setMode('login'); setError(null); }} className={`px-4 py-2 rounded-full transition ${mode === 'login' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'} `}>Đăng nhập</button>
                                    <button type="button" onClick={() => { setMode('register'); setError(null); }} className={`px-4 py-2 rounded-full transition ${mode === 'register' ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'} `}>Đăng ký</button>
                                </div>
                                <h3 className="font-headline-md text-headline-md text-on-surface">{mode === 'login' ? 'Chào mừng quay trở lại' : 'Tạo tài khoản mới'}</h3>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{mode === 'login' ? 'Vui lòng nhập thông tin để truy cập tài khoản của bạn.' : 'Bắt đầu hành trình tìm kiếm công việc mơ ước của bạn.'}</p>
                            </div>
                            {error && <div className="text-red-600">{error}</div>}
                            {mode === 'login' ? (
                                <form className="flex flex-col gap-md" onSubmit={handleLogin}>
                                    <div className="flex flex-col gap-xs">
                                        <label className="font-label-md text-label-md text-on-surface-variant ml-xs">Email</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline" data-icon="mail">mail</span>
                                            <input value={email} onChange={e => setEmail(e.target.value)}
                                                className="w-full h-[48px] pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                                                placeholder="example@gmail.com" type="email" required />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-xs">
                                        <label className="font-label-md text-label-md text-on-surface-variant ml-xs">Mật khẩu</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline" data-icon="lock">lock</span>
                                            <input value={password} onChange={e => setPassword(e.target.value)}
                                                className="w-full h-[48px] pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                                                placeholder="••••••••" type="password" required />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-xs">
                                        <label className="flex items-center gap-sm cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input className="peer appearance-none w-5 h-5 border-2 border-outline rounded-md checked:bg-primary checked:border-primary transition-all cursor-pointer" type="checkbox" />
                                                <span className="material-symbols-outlined absolute text-white scale-0 peer-checked:scale-100 transition-transform text-[16px] left-[2px]" data-icon="check">check</span>
                                            </div>
                                            <span className="font-body-sm text-body-sm text-on-surface group-hover:text-primary transition-colors">Ghi nhớ đăng nhập</span>
                                        </label>
                                        <a className="font-label-md text-label-md text-primary hover:underline" href="#">Quên mật khẩu?</a>
                                    </div>
                                    <button disabled={loading} className="w-full h-[48px] bg-primary-container text-white font-label-md text-label-md rounded-xl shadow-sm hover:translate-y-[-2px] active:scale-[0.98] transition-all duration-200 mt-md" type="submit">
                                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                                    </button>
                                </form>
                            ) : (
                                <form className="flex flex-col gap-md" onSubmit={handleRegister}>
                                    <div className="flex flex-col gap-xs">
                                        <label className="font-label-md text-label-md text-on-surface-variant ml-xs">Họ và Tên</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline" data-icon="person">person</span>
                                            <input value={name} onChange={e => setName(e.target.value)} className="w-full h-[48px] pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all" placeholder="Nguyễn Văn A" type="text" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-xs">
                                        <label className="font-label-md text-label-md text-on-surface-variant ml-xs">Email</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline" data-icon="mail">mail</span>
                                            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full h-[48px] pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all" placeholder="example@gmail.com" type="email" required />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-xs">
                                        <label className="font-label-md text-label-md text-on-surface-variant ml-xs">Mật khẩu</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline" data-icon="lock">lock</span>
                                            <input value={password} onChange={e => setPassword(e.target.value)} className="w-full h-[48px] pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all" placeholder="Tối thiểu 8 ký tự" type="password" required />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-xs">
                                        <label className="font-label-md text-label-md text-on-surface-variant ml-xs">Xác nhận mật khẩu</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline" data-icon="lock_reset">lock_reset</span>
                                            <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full h-[48px] pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all" placeholder="Nhập lại mật khẩu" type="password" required />
                                        </div>
                                    </div>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Bằng cách đăng ký, bạn đồng ý với <a className="text-primary hover:underline" href="#">Điều khoản dịch vụ</a> và <a className="text-primary hover:underline" href="#">Chính sách bảo mật</a> của chúng tôi.</p>
                                    <button disabled={loading} className="w-full h-[48px] bg-primary-container text-white font-label-md text-label-md rounded-xl shadow-sm hover:translate-y-[-2px] active:scale-[0.98] transition-all duration-200 mt-md" type="submit">{loading ? 'Đang xử lý...' : 'Đăng ký'}</button>
                                </form>
                            )}

                            <div className="relative flex items-center py-md">
                                <div className="flex-grow border-t border-outline-variant"></div>
                                <span className="flex-shrink mx-md font-label-sm text-label-sm text-outline">Hoặc tiếp tục với</span>
                                <div className="flex-grow border-t border-outline-variant"></div>
                            </div>
                            <button className="w-full h-[48px] border border-outline-variant bg-surface-container-low text-on-surface font-label-md text-label-md rounded-xl flex items-center justify-center gap-md hover:bg-surface-container-high active:scale-[0.98] transition-all duration-200">
                                <img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwnP0jfNW9MMa6BT8Y2YKQ4B0VCzI8hCWCMGNhf_KPmU2JVOycA6nohXg7efcD-He_E5ROrAlOssW5BJuvLtY-ax-ddAr7xIt442_8_TcKIcksyZj49XCaGSn0tO2pGLvdsjYI7QrXxeZp63UYCI0iDh2jEDKbjE3FNWcj7v6o4nzXCqkZMWA1-MHdTXt7P3GPgvW35fMt0FUOpM7poo-H8Lpxan7eY4GrYqevX5MSKItPmoCVmgzVahvwtfXgg3bS1zLuwp_m3Gai" />
                                Đăng nhập với Google
                            </button>

                            <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
                                {mode === 'login' ? (
                                    <>Chưa có tài khoản? <button type="button" onClick={() => { setMode('register'); setError(null); }} className="text-primary font-bold hover:underline cursor-pointer">Đăng ký ngay</button></>
                                ) : (
                                    <>Đã có tài khoản? <button type="button" onClick={() => { setMode('login'); setError(null); }} className="text-primary font-bold hover:underline cursor-pointer">Đăng nhập ngay</button></>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}