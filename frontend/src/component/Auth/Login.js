export default function Login() {
    return (
        <>
            <main class="flex-grow flex items-center justify-center p-md md:p-xl">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-xl max-w-container-max w-full mx-auto items-center">
                    {/* <!-- Left Side: Visual/Context (Visible on Desktop) --> */}
                    <div class="hidden lg:flex flex-col gap-lg pr-xl">
                        <div class="flex items-center gap-sm">
                            <span class="material-symbols-outlined text-primary text-[48px]" data-icon="work">work</span>
                            <h1 class="font-display text-display text-primary">JobFlow</h1>
                        </div>
                        <h2 class="font-headline-lg text-headline-lg text-on-surface">Kết nối ước mơ, <br /><span
                            class="text-primary-container">kiến tạo tương lai.</span></h2>
                        <p class="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                            Nền tảng tìm kiếm việc làm bán thời gian hàng đầu dành cho sinh viên và người làm tự do. Đơn giản,
                            nhanh chóng và hiệu quả.
                        </p>
                        <div class="grid grid-cols-2 gap-md mt-xl">
                            <div class="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant">
                                <span class="material-symbols-outlined text-primary mb-sm"
                                    data-icon="verified_user">verified_user</span>
                                <p class="font-label-md text-label-md text-on-surface">Tin cậy &amp; Bảo mật</p>
                            </div>
                            <div class="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant">
                                <span class="material-symbols-outlined text-primary mb-sm" data-icon="bolt">bolt</span>
                                <p class="font-label-md text-label-md text-on-surface">Ứng tuyển nhanh</p>
                            </div>
                        </div>
                    </div>
                    {/* <!-- Right Side: Auth Forms Container --> */}
                    <div class="w-full flex justify-center lg:justify-end">
                        {/* <!-- LOGIN CARD --> */}
                        <div class="w-full max-w-[480px] bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant p-xl flex flex-col gap-xl"
                            id="login-section">
                            <div class="text-center lg:text-left">
                                <div class="lg:hidden flex justify-center items-center gap-xs mb-md">
                                    <span class="material-symbols-outlined text-primary" data-icon="work">work</span>
                                    <span class="font-display text-headline-md font-bold text-primary">JobFlow</span>
                                </div>
                                <h3 class="font-headline-md text-headline-md text-on-surface">Chào mừng quay trở lại</h3>
                                <p class="font-body-sm text-body-sm text-on-surface-variant mt-xs">Vui lòng nhập thông tin để
                                    truy cập tài khoản của bạn.</p>
                            </div>
                            <form class="flex flex-col gap-md">
                                <div class="flex flex-col gap-xs">
                                    <label class="font-label-md text-label-md text-on-surface-variant ml-xs">Email</label>
                                    <div class="relative">
                                        <span
                                            class="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline"
                                            data-icon="mail">mail</span>
                                        <input
                                            class="w-full h-[48px] pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                                            placeholder="example@gmail.com" type="email" />
                                    </div>
                                </div>
                                <div class="flex flex-col gap-xs">
                                    <label class="font-label-md text-label-md text-on-surface-variant ml-xs">Mật khẩu</label>
                                    <div class="relative">
                                        <span
                                            class="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline"
                                            data-icon="lock">lock</span>
                                        <input
                                            class="w-full h-[48px] pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                                            placeholder="••••••••" type="password" />
                                        <button
                                            class="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                                            type="button">
                                            <span class="material-symbols-outlined" data-icon="visibility">visibility</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between mt-xs">
                                    <label class="flex items-center gap-sm cursor-pointer group">
                                        <div class="relative flex items-center">
                                            <input
                                                class="peer appearance-none w-5 h-5 border-2 border-outline rounded-md checked:bg-primary checked:border-primary transition-all cursor-pointer"
                                                type="checkbox" />
                                            <span
                                                class="material-symbols-outlined absolute text-white scale-0 peer-checked:scale-100 transition-transform text-[16px] left-[2px]"
                                                data-icon="check">check</span>
                                        </div>
                                        <span
                                            class="font-body-sm text-body-sm text-on-surface group-hover:text-primary transition-colors">Ghi
                                            nhớ đăng nhập</span>
                                    </label>
                                    <a class="font-label-md text-label-md text-primary hover:underline" href="#">Quên mật
                                        khẩu?</a>
                                </div>
                                <button
                                    class="w-full h-[48px] bg-primary-container text-white font-label-md text-label-md rounded-xl shadow-sm hover:translate-y-[-2px] active:scale-[0.98] transition-all duration-200 mt-md"
                                    type="submit">
                                    Đăng nhập
                                </button>
                            </form>
                            <div class="relative flex items-center py-md">
                                <div class="flex-grow border-t border-outline-variant"></div>
                                <span class="flex-shrink mx-md font-label-sm text-label-sm text-outline">Hoặc tiếp tục
                                    với</span>
                                <div class="flex-grow border-t border-outline-variant"></div>
                            </div>
                            <button
                                class="w-full h-[48px] border border-outline-variant bg-surface-container-low text-on-surface font-label-md text-label-md rounded-xl flex items-center justify-center gap-md hover:bg-surface-container-high active:scale-[0.98] transition-all duration-200">
                                <img alt="Google Logo" class="w-5 h-5"
                                    data-alt="The official Google brand logo with its iconic four-color circular design in high resolution, presented on a clean transparent background for professional UI integration. The colors are vibrant and follow official brand guidelines."
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwnP0jfNW9MMa6BT8Y2YKQ4B0VCzI8hCWCMGNhf_KPmU2JVOycA6nohXg7efcD-He_E5ROrAlOssW5BJuvLtY-ax-ddAr7xIt442_8_TcKIcksyZj49XCaGSn0tO2pGLvdsjYI7QrXxeZp63UYCI0iDh2jEDKbjE3FNWcj7v6o4nzXCqkZMWA1-MHdTXt7P3GPgvW35fMt0FUOpM7poo-H8Lpxan7eY4GrYqevX5MSKItPmoCVmgzVahvwtfXgg3bS1zLuwp_m3Gai" />
                                Đăng nhập với Google
                            </button>
                            <p class="text-center font-body-sm text-body-sm text-on-surface-variant">
                                Chưa có tài khoản? <a class="text-primary font-bold hover:underline cursor-pointer"
                                    href="#register"
                                    onclick="document.getElementById('login-section').classList.add('hidden'); document.getElementById('register-section').classList.remove('hidden');">Đăng
                                    ký ngay</a>
                            </p>
                        </div>
                        {/* <!-- REGISTER CARD (Hidden by default) --> */}
                        <div class="hidden w-full max-w-[480px] bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant p-xl flex flex-col gap-xl"
                            id="register-section">
                            <div class="text-center lg:text-left">
                                <div class="lg:hidden flex justify-center items-center gap-xs mb-md">
                                    <span class="material-symbols-outlined text-primary" data-icon="work">work</span>
                                    <span class="font-display text-headline-md font-bold text-primary">JobFlow</span>
                                </div>
                                <h3 class="font-headline-md text-headline-md text-on-surface">Tạo tài khoản mới</h3>
                                <p class="font-body-sm text-body-sm text-on-surface-variant mt-xs">Bắt đầu hành trình tìm kiếm
                                    công việc mơ ước của bạn.</p>
                            </div>
                            <form class="flex flex-col gap-md">
                                <div class="flex flex-col gap-xs">
                                    <label class="font-label-md text-label-md text-on-surface-variant ml-xs">Họ và Tên</label>
                                    <div class="relative">
                                        <span
                                            class="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline"
                                            data-icon="person">person</span>
                                        <input
                                            class="w-full h-[48px] pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                                            placeholder="Nguyễn Văn A" type="text" />
                                    </div>
                                </div>
                                <div class="flex flex-col gap-xs">
                                    <label class="font-label-md text-label-md text-on-surface-variant ml-xs">Email</label>
                                    <div class="relative">
                                        <span
                                            class="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline"
                                            data-icon="mail">mail</span>
                                        <input
                                            class="w-full h-[48px] pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                                            placeholder="example@gmail.com" type="email" />
                                    </div>
                                </div>
                                <div class="flex flex-col gap-xs">
                                    <label class="font-label-md text-label-md text-on-surface-variant ml-xs">Mật khẩu</label>
                                    <div class="relative">
                                        <span
                                            class="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline"
                                            data-icon="lock">lock</span>
                                        <input
                                            class="w-full h-[48px] pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                                            placeholder="Tối thiểu 8 ký tự" type="password" />
                                    </div>
                                </div>
                                <div class="flex flex-col gap-xs">
                                    <label class="font-label-md text-label-md text-on-surface-variant ml-xs">Xác nhận mật
                                        khẩu</label>
                                    <div class="relative">
                                        <span
                                            class="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline"
                                            data-icon="lock_reset">lock_reset</span>
                                        <input
                                            class="w-full h-[48px] pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none transition-all"
                                            placeholder="Nhập lại mật khẩu" type="password" />
                                    </div>
                                </div>
                                <p class="font-body-sm text-body-sm text-on-surface-variant mt-xs">
                                    Bằng cách đăng ký, bạn đồng ý với <a class="text-primary hover:underline" href="#">Điều
                                        khoản dịch vụ</a> và <a class="text-primary hover:underline" href="#">Chính sách bảo
                                            mật</a> của chúng tôi.
                                </p>
                                <button
                                    class="w-full h-[48px] bg-primary-container text-white font-label-md text-label-md rounded-xl shadow-sm hover:translate-y-[-2px] active:scale-[0.98] transition-all duration-200 mt-md"
                                    type="submit">
                                    Đăng ký
                                </button>
                            </form>
                            <p class="text-center font-body-sm text-body-sm text-on-surface-variant">
                                Đã có tài khoản? <a class="text-primary font-bold hover:underline cursor-pointer" href="#login"
                                    onclick="document.getElementById('register-section').classList.add('hidden'); document.getElementById('login-section').classList.remove('hidden');">Đăng
                                    nhập ngay</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}