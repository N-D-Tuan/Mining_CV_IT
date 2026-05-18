export default function Home() {
    return (
        <>
            <div class="p-gutter max-w-container-max mx-auto space-y-xl">
                {/* <!-- Statistic Cards Grid --> */}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
                    {/* <!-- Stat Card 1 --> */}
                    <div
                        class="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group">
                        <div class="flex justify-between items-start mb-md">
                            <div class="p-sm bg-primary-fixed rounded-lg text-primary">
                                <span class="material-symbols-outlined">send</span>
                            </div>
                            <span class="text-green-600 font-label-sm flex items-center gap-xs">+12% <span
                                    class="material-symbols-outlined text-[14px]">trending_up</span></span>
                        </div>
                        <h3 class="font-body-sm text-on-surface-variant">Tổng công việc đã ứng tuyển</h3>
                        <p class="font-display text-headline-md mt-xs">24</p>
                    </div>
                    {/* <!-- Stat Card 2 --> */}
                    <div
                        class="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group">
                        <div class="flex justify-between items-start mb-md">
                            <div class="p-sm bg-secondary-fixed rounded-lg text-secondary">
                                <span class="material-symbols-outlined">bookmark</span>
                            </div>
                            <span class="text-on-surface-variant font-label-sm">Ổn định</span>
                        </div>
                        <h3 class="font-body-sm text-on-surface-variant">Công việc đã lưu</h3>
                        <p class="font-display text-headline-md mt-xs">15</p>
                    </div>
                    {/* <!-- Stat Card 3 --> */}
                    <div
                        class="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group">
                        <div class="flex justify-between items-start mb-md">
                            <div class="p-sm bg-tertiary-fixed rounded-lg text-tertiary">
                                <span class="material-symbols-outlined">visibility</span>
                            </div>
                            <span class="text-green-600 font-label-sm flex items-center gap-xs">+5% <span
                                    class="material-symbols-outlined text-[14px]">trending_up</span></span>
                        </div>
                        <h3 class="font-body-sm text-on-surface-variant">Lượt xem hồ sơ</h3>
                        <p class="font-display text-headline-md mt-xs">342</p>
                    </div>
                    {/* <!-- Stat Card 4 --> */}
                    <div
                        class="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow group">
                        <div class="flex justify-between items-start mb-md">
                            <div class="p-sm bg-error-container rounded-lg text-on-error-container">
                                <span class="material-symbols-outlined">bolt</span>
                            </div>
                            <span class="text-primary font-label-sm">Rất tốt</span>
                        </div>
                        <h3 class="font-body-sm text-on-surface-variant">Tỷ lệ phản hồi</h3>
                        <p class="font-display text-headline-md mt-xs">88%</p>
                    </div>
                </div>
                {/* <!-- Bento Grid Content --> */}
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-lg">
                    {/* <!-- Chart Section (Bar Chart Simulation) --> */}
                    <div
                        class="lg:col-span-8 bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
                        <div class="flex justify-between items-center mb-xl">
                            <h2 class="font-headline-sm">Hoạt động tìm việc trong 30 ngày qua</h2>
                            <div class="flex gap-sm">
                                <button
                                    class="px-md py-xs rounded-full border border-outline-variant font-label-sm hover:bg-surface-container-low">Tháng
                                    này</button>
                                <button
                                    class="px-md py-xs rounded-full bg-primary-container text-on-primary-container font-label-sm">30
                                    ngày qua</button>
                            </div>
                        </div>
                        {/* <!-- Bar Chart Viz --> */}
                        <div class="flex items-end justify-between h-48 gap-xs">
                            <div
                                class="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[40%]">
                            </div>
                            <div
                                class="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[60%]">
                            </div>
                            <div
                                class="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[35%]">
                            </div>
                            <div
                                class="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[80%]">
                            </div>
                            <div class="w-full bg-primary-container rounded-t-lg h-[95%]"></div>
                            <div
                                class="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[55%]">
                            </div>
                            <div
                                class="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[70%]">
                            </div>
                            <div
                                class="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[45%]">
                            </div>
                            <div
                                class="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[30%]">
                            </div>
                            <div
                                class="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[85%]">
                            </div>
                            <div
                                class="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[40%]">
                            </div>
                            <div
                                class="w-full bg-primary-fixed-dim rounded-t-lg transition-all duration-300 hover:bg-primary-container h-[50%]">
                            </div>
                        </div>
                        <div class="flex justify-between mt-md text-on-surface-variant font-label-sm">
                            <span>01 Th05</span>
                            <span>10 Th05</span>
                            <span>20 Th05</span>
                            <span>30 Th05</span>
                        </div>
                    </div>
                    {/* <!-- Recent Activity Timeline --> */}
                    <div
                        class="lg:col-span-4 bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
                        <h2 class="font-headline-sm mb-xl">Hoạt động gần đây</h2>
                        <div class="space-y-lg relative flex-1">
                            {/* <!-- Timeline Line --> */}
                            <div class="absolute left-3 top-2 bottom-2 w-0.5 bg-outline-variant"></div>
                            <div class="relative flex gap-md items-start">
                                <div
                                    class="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center z-10 shrink-0">
                                    <span class="material-symbols-outlined text-[14px]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-label-md text-on-surface">Ứng tuyển thành công: Graphic
                                        Designer</span>
                                    <span class="font-body-sm text-on-surface-variant">Hôm nay, 09:30 AM</span>
                                </div>
                            </div>
                            <div class="relative flex gap-md items-start">
                                <div
                                    class="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center z-10 shrink-0">
                                    <span class="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-label-md text-on-surface">Phỏng vấn mời từ The Coffee House</span>
                                    <span class="font-body-sm text-on-surface-variant">Hôm qua, 03:15 PM</span>
                                </div>
                            </div>
                            <div class="relative flex gap-md items-start">
                                <div
                                    class="w-6 h-6 rounded-full bg-outline-variant text-on-surface flex items-center justify-center z-10 shrink-0">
                                    <span class="material-symbols-outlined text-[14px]">notifications_active</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-label-md text-on-surface">Cảnh báo việc làm mới: UI/UX
                                        Designer</span>
                                    <span class="font-body-sm text-on-surface-variant">25 Th05, 10:00 AM</span>
                                </div>
                            </div>
                        </div>
                        <button class="mt-xl text-primary font-label-md hover:underline text-left">Xem tất cả hoạt
                            động</button>
                    </div>
                    {/* <!-- Recommended Carousel Section --> */}
                    <div class="lg:col-span-12">
                        <div class="flex items-center justify-between mb-lg">
                            <h2 class="font-headline-sm">Gợi ý việc làm cho bạn</h2>
                            <div class="flex gap-sm">
                                <button
                                    class="p-xs rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors">
                                    <span class="material-symbols-outlined">chevron_left</span>
                                </button>
                                <button
                                    class="p-xs rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors">
                                    <span class="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-lg">
                            {/* <!-- Recommended Card 1 --> */}
                            <div
                                class="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:scale-[1.01] transition-transform cursor-pointer group">
                                <div class="flex items-start justify-between mb-md">
                                    <img alt="Company Logo" class="w-12 h-12 rounded-lg object-cover"
                                        data-alt="A minimalist tech company logo featuring abstract geometric shapes in vibrant blue and white. The aesthetic is clean, modern, and professional, representative of a cutting-edge creative agency or startup. High-resolution digital art style."
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZknfDIJreikvfv_JR6d6oAkcqMA7GkzBkVfcMyiYcWJDU-nBbbtuS1VlgD9x85evDaYWNJrC8cqsblhhzX5L7unvTx6WzFv1HKQkNxec4j9FZRB0u51nSDxjfmFr01CPkSbH4IijEUNvDnHq7MljsXO7l1klIbLjRwaidCW2zSObYa6mQKPPzMcQ2W8ZKrNPF2LdsIKI9dxXzqiqtpehxlU30lfrzRXGTUduGBtvMUQLp_DG1AQJZHyBfYgOmfI7V9UTk522Hmicv" />
                                    <span
                                        class="bg-surface-container-high px-sm py-xs rounded-full font-label-sm text-on-surface-variant">Freelance</span>
                                </div>
                                <h4 class="font-headline-sm mb-xs group-hover:text-primary transition-colors">UI/UX
                                    Product Designer</h4>
                                <p class="font-body-sm text-on-surface-variant mb-md">Creative Mind Agency • Quận 1,
                                    TP.HCM</p>
                                <div class="flex items-center justify-between">
                                    <span class="font-label-md text-primary">15tr - 20tr VNĐ</span>
                                    <button
                                        class="bg-secondary-container text-on-secondary-container px-md py-xs rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors">Chi
                                        tiết</button>
                                </div>
                            </div>
                            {/* <!-- Recommended Card 2 --> */}
                            <div
                                class="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:scale-[1.01] transition-transform cursor-pointer group">
                                <div class="flex items-start justify-between mb-md">
                                    <img alt="Company Logo" class="w-12 h-12 rounded-lg object-cover"
                                        data-alt="A premium food and beverage brand logo with elegant, warm tones. The design features a stylized coffee bean or cup in deep brown and gold accents, evoking a sense of high-quality hospitality and comfort. Modern corporate branding for a premium cafe chain."
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd6fr3K6d3CoXlAccDlBsp94kZE_chWVsKvRKAoScn-onmkrj5TIgdLWJf6xpw-TwXR0Yx0jBv5FQns8tf7vqGD5lEig31LwXBkBRIpP1aBhncdotSpkpKWFmZqzbmihg0KURkl7UByrsZ4bc2C_Vk3dwA6MwzguDbOPsHdFmKuu_lQfqP1DCCuX-_Og3WmFYUt8NZh1v9jqjlsAJT79kggAVLvetB51pRPw5WmJ1uDAZTjOXU4YZMpjAXgFfMKRv0Znf6ZNqgcY_7" />
                                    <span
                                        class="bg-surface-container-high px-sm py-xs rounded-full font-label-sm text-on-surface-variant">Part-time</span>
                                </div>
                                <h4 class="font-headline-sm mb-xs group-hover:text-primary transition-colors">Barista
                                    Senior</h4>
                                <p class="font-body-sm text-on-surface-variant mb-md">The Coffee House • Quận 3, TP.HCM
                                </p>
                                <div class="flex items-center justify-between">
                                    <span class="font-label-md text-primary">35k - 45k/giờ</span>
                                    <button
                                        class="bg-secondary-container text-on-secondary-container px-md py-xs rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors">Chi
                                        tiết</button>
                                </div>
                            </div>
                            {/* <!-- Recommended Card 3 --> */}
                            <div
                                class="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:scale-[1.01] transition-transform cursor-pointer group">
                                <div class="flex items-start justify-between mb-md">
                                    <img alt="Company Logo" class="w-12 h-12 rounded-lg object-cover"
                                        data-alt="A clean corporate logo for a modern educational institution or tutoring center. The logo uses blue and grey tones with a book or graduation cap icon integrated into the brand name. The style is professional, trustworthy, and academic."
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEZ5UPQQaCs9rcWiE1bkQPN1YdlIxRM1Fab3E0iuZ81cQk1lwdlGoSxfn91q_iGrBvePrCZDq1efxfem-YtLWrOeBDCTsNmaj8V57uQN3cLLQecwz93R-R8NxRas22zfiCNmc6jmOHM3THNars-DcagPmy8937YP79hC4kyOKZVzHUegJWpG8bS7LJ6c34_imTRdzkPzdFfQi75WWCVqtNu7DNsZK22GieAfUUP9lx_vYCMTHarUW99C9fpsFZkGM1l4gG0q_sKNMm" />
                                    <span
                                        class="bg-surface-container-high px-sm py-xs rounded-full font-label-sm text-on-surface-variant">Freelance</span>
                                </div>
                                <h4 class="font-headline-sm mb-xs group-hover:text-primary transition-colors">Gia sư
                                    Tiếng Anh (IELTS)</h4>
                                <p class="font-body-sm text-on-surface-variant mb-md">EduGrowth Center • Online / Thủ
                                    Đức</p>
                                <div class="flex items-center justify-between">
                                    <span class="font-label-md text-primary">250k - 400k/giờ</span>
                                    <button
                                        class="bg-secondary-container text-on-secondary-container px-md py-xs rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors">Chi
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