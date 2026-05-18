export default function Search_UI() {
    return (
        <>
            <main class="max-w-container-max mx-auto px-gutter py-xl">
                <div class="flex flex-col lg:flex-row gap-xl">
                    {/* <!-- Sidebar Filter --> */}
                    <aside class="hidden lg:flex flex-col gap-md w-72 h-fit sticky top-24">
                        <div
                            class="bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
                            <div class="flex items-center justify-between mb-lg">
                                <div class="flex items-center gap-sm">
                                    <span class="material-symbols-outlined text-primary">filter_list</span>
                                    <h2 class="font-headline-sm text-headline-sm">Bộ lọc</h2>
                                </div>
                            </div>
                            {/* <!-- Collapsible Section: Địa điểm --> */}
                            <div class="mb-lg">
                                <div class="flex items-center justify-between mb-sm cursor-pointer group">
                                    <span class="font-label-md text-label-md uppercase text-outline">Địa điểm</span>
                                    <span class="material-symbols-outlined text-sm">keyboard_arrow_up</span>
                                </div>
                                <div class="relative">
                                    <input
                                        class="w-full bg-surface-bright border border-outline-variant rounded-lg px-md py-sm text-body-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                        placeholder="Tìm thành phố..." type="text" />
                                    <span
                                        class="material-symbols-outlined absolute right-3 top-2 text-outline text-lg">search</span>
                                </div>
                            </div>
                            {/* <!-- Collapsible Section: Lương --> */}
                            <div class="mb-lg">
                                <div class="flex items-center justify-between mb-sm">
                                    <span class="font-label-md text-label-md uppercase text-outline">Mức lương</span>
                                </div>
                                <div class="px-xs py-md">
                                    <input
                                        class="w-full h-2 bg-secondary-container rounded-lg appearance-none cursor-pointer accent-primary"
                                        type="range" />
                                    <div class="flex justify-between mt-sm text-body-sm text-on-surface-variant font-medium">
                                        <span>0</span>
                                        <span>50tr+</span>
                                    </div>
                                </div>
                            </div>
                            {/* <!-- Collapsible Section: Categories --> */}
                            <div class="mb-lg">
                                <div class="flex items-center justify-between mb-sm">
                                    <span class="font-label-md text-label-md uppercase text-outline">Danh mục</span>
                                </div>
                                <div class="flex flex-col gap-sm">
                                    <label class="flex items-center gap-sm cursor-pointer group">
                                        <input class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                                            type="checkbox" />
                                        <span class="text-body-sm group-hover:text-primary transition-colors">Tech &amp;
                                            IT</span>
                                    </label>
                                    <label class="flex items-center gap-sm cursor-pointer group">
                                        <input checked=""
                                            class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                                            type="checkbox" />
                                        <span class="text-body-sm text-primary font-medium">F&amp;B - Nhà hàng</span>
                                    </label>
                                    <label class="flex items-center gap-sm cursor-pointer group">
                                        <input class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                                            type="checkbox" />
                                        <span class="text-body-sm group-hover:text-primary transition-colors">Marketing</span>
                                    </label>
                                    <label class="flex items-center gap-sm cursor-pointer group">
                                        <input class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                                            type="checkbox" />
                                        <span class="text-body-sm group-hover:text-primary transition-colors">Thiết kế</span>
                                    </label>
                                </div>
                            </div>
                            {/* <!-- Collapsible Section: Work Type --> */}
                            <div class="mb-lg">
                                <div class="flex items-center justify-between mb-sm">
                                    <span class="font-label-md text-label-md uppercase text-outline">Hình thức</span>
                                </div>
                                <div class="flex flex-wrap gap-xs">
                                    <button
                                        class="px-md py-xs rounded-full border border-outline-variant bg-surface text-label-sm hover:border-primary transition-all">Remote</button>
                                    <button
                                        class="px-md py-xs rounded-full border border-primary bg-primary-container text-on-primary-container text-label-sm font-bold">Văn
                                        phòng</button>
                                    <button
                                        class="px-md py-xs rounded-full border border-outline-variant bg-surface text-label-sm hover:border-primary transition-all">Hybrid</button>
                                </div>
                            </div>
                            {/* <!-- Clear All Filters --> */}
                            <button
                                class="w-full mt-md py-md rounded-xl border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high hover:text-error transition-all flex items-center justify-center gap-sm">
                                <span class="material-symbols-outlined text-md">close</span>
                                Xóa bộ lọc
                            </button>
                        </div>
                        {/* <!-- Featured Categories Widget --> */}
                        <div class="bg-primary-container rounded-xl p-md text-on-primary-container">
                            <h3 class="font-headline-sm text-headline-sm mb-xs">Mở rộng cơ hội?</h3>
                            <p class="text-body-sm opacity-90 mb-md">Tham gia các khóa học ngắn hạn để tăng tỷ lệ được tuyển
                                dụng.</p>
                            <button
                                class="w-full py-sm bg-white text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all text-label-md">Xem
                                khóa học</button>
                        </div>
                    </aside>
                    {/* <!-- Main Content Area --> */}
                    <section class="flex-1">
                        {/* <!-- Search & Sort Bar --> */}
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl">
                            <div>
                                <h1 class="font-headline-md text-headline-md text-on-surface">Tìm thấy <span
                                    class="text-primary">128</span> công việc</h1>
                                <p class="text-body-sm text-on-surface-variant">Việc làm mới nhất được cập nhật mỗi 5 phút</p>
                            </div>
                            <div class="flex items-center gap-sm">
                                <span class="text-body-sm text-on-surface-variant font-medium">Sắp xếp:</span>
                                <div class="relative">
                                    <select
                                        class="appearance-none bg-surface-container-low border border-outline-variant rounded-lg pl-md pr-10 py-sm text-body-sm font-medium focus:ring-2 focus:ring-primary outline-none cursor-pointer">
                                        <option>Mới nhất</option>
                                        <option>Lương cao nhất</option>
                                        <option>Gần tôi nhất</option>
                                    </select>
                                    <span
                                        class="material-symbols-outlined absolute right-2 top-2 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                        </div>
                        {/* <!-- Job List --> */}
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-lg">
                            {/* <!-- Job Card 1 --> */}
                            <article
                                class="group bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 relative overflow-hidden">
                                <div class="flex flex-col lg:flex-row gap-lg">
                                    <div
                                        class="h-16 w-16 min-w-[64px] bg-white rounded-xl border border-outline-variant flex items-center justify-center p-sm shadow-inner">
                                        <img alt="Company logo"
                                            data-alt="A clean, minimalist logo of a modern technology startup company. The logo features abstract geometric shapes in electric blue and charcoal grey against a pristine white background. The lighting is crisp and uniform, representing a professional, high-end corporate identity for a forward-thinking software firm."
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPa1eKgfIf0CFevOfGwb9gVw50dw-oC5AXN4PzVYgumjb5RpXIzKS8uRI5nLF7AJgzLnLynFNu7MaZNbQFE1mDGd4RhSoZyMervFuYNCZ1DRC0S93jBZWaxQwai6QcZxz3j7rsy9vgtKzR0Rc5sqdBpzF9g_qUxSthbFHaLysuumCwYn_CnsmI_MC5p7yU9JrjtwWEPDDMkVDLkWU8kg8bs_JbLXQtGu_2vRUIakUbG4n0NOVFXN6fvb4OGOBuZAkrEO8ChbQ1oS-S" />
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <h3
                                                    class="font-headline-sm text-headline-sm group-hover:text-primary transition-colors mb-xs">
                                                    UI/UX Designer (Part-time)</h3>
                                                <p class="text-body-sm text-secondary font-medium">Figma Solutions Vietnam</p>
                                            </div>
                                            <button class="p-xs text-outline hover:text-error transition-colors">
                                                <span class="material-symbols-outlined">favorite</span>
                                            </button>
                                        </div>
                                        <div class="flex flex-wrap gap-md mt-md text-on-surface-variant">
                                            <div class="flex items-center gap-xs">
                                                <span class="material-symbols-outlined text-lg text-primary">payments</span>
                                                <span class="text-body-sm font-bold text-on-surface">15tr - 20tr VNĐ</span>
                                            </div>
                                            <div class="flex items-center gap-xs">
                                                <span class="material-symbols-outlined text-lg text-outline">location_on</span>
                                                <span class="text-body-sm">Thảo Điền, Quận 2, HCM</span>
                                            </div>
                                            <div class="flex items-center gap-xs">
                                                <span class="material-symbols-outlined text-lg text-outline">schedule</span>
                                                <span class="text-body-sm">2 giờ trước</span>
                                            </div>
                                        </div>
                                        <div class="flex flex-wrap gap-sm mt-md">
                                            <span
                                                class="px-md py-xs bg-surface-container rounded-full text-label-sm text-on-secondary-container">Sinh
                                                viên</span>
                                            <span
                                                class="px-md py-xs bg-surface-container rounded-full text-label-sm text-on-secondary-container">Tiếng
                                                Anh Giao Tiếp</span>
                                            <span
                                                class="px-md py-xs bg-tertiary-fixed-dim bg-opacity-20 text-tertiary-fixed-dim rounded-full text-label-sm font-bold border border-tertiary-fixed-dim">Hot
                                                Job</span>
                                        </div>
                                    </div>
                                    <div class="lg:self-center">
                                        <button
                                            class="w-full lg:w-auto px-2xl py-md bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-container shadow-sm active:scale-[0.98] transition-all">Ứng
                                            tuyển</button>
                                    </div>
                                </div>
                            </article>
                            {/* <!-- Job Card 2 --> */}
                            <article
                                class="group bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 relative overflow-hidden">
                                <div class="flex flex-col lg:flex-row gap-lg">
                                    <div
                                        class="h-16 w-16 min-w-[64px] bg-white rounded-xl border border-outline-variant flex items-center justify-center p-sm shadow-inner">
                                        <img alt="Company logo"
                                            data-alt="A minimalist logo for a trendy cafe or restaurant chain. The design uses elegant, handwritten typography in deep brown tones on a cream-colored circle. The background is soft and airy with a slight warm glow, suggesting a welcoming, artisanal, and high-quality food and beverage brand."
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWFBBh3Rfrny9AMS8f1ywUUTmcZuc8VkWQZ9LZysnt4U3BDMd6DftLNivr6GbD07zUTbiaMUQygaMUyBkTT6Np9vrAhKVFbxrjifTelsC1-WPSSfgSQUoUyHmo8XJWDFnrg_fX89tUegtlkkXzgkxBfnPv6zVcbL-st-EQpqGbhoCcpYKrquhoLXkiUsHe5-ZKJF-Of-Y1Nz6tTvH5FuT_DthXu4MVNNGZf1pMUHyE2WNxZaeyjIXs4hpMMMg3P1xb96NPeGW34FkE" />
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <h3
                                                    class="font-headline-sm text-headline-sm group-hover:text-primary transition-colors mb-xs">
                                                    Phục vụ Coffee theo ca</h3>
                                                <p class="text-body-sm text-secondary font-medium">Urban Beans Co.</p>
                                            </div>
                                            <button class="p-xs text-outline hover:text-error transition-colors">
                                                <span class="material-symbols-outlined">favorite</span>
                                            </button>
                                        </div>
                                        <div class="flex flex-wrap gap-md mt-md text-on-surface-variant">
                                            <div class="flex items-center gap-xs">
                                                <span class="material-symbols-outlined text-lg text-primary">payments</span>
                                                <span class="text-body-sm font-bold text-on-surface">25k - 35k/giờ</span>
                                            </div>
                                            <div class="flex items-center gap-xs">
                                                <span class="material-symbols-outlined text-lg text-outline">location_on</span>
                                                <span class="text-body-sm">Quận 1, HCM</span>
                                            </div>
                                            <div class="flex items-center gap-xs">
                                                <span class="material-symbols-outlined text-lg text-outline">schedule</span>
                                                <span class="text-body-sm">5 giờ trước</span>
                                            </div>
                                        </div>
                                        <div class="flex flex-wrap gap-sm mt-md">
                                            <span
                                                class="px-md py-xs bg-surface-container rounded-full text-label-sm text-on-secondary-container">Không
                                                kinh nghiệm</span>
                                            <span
                                                class="px-md py-xs bg-surface-container rounded-full text-label-sm text-on-secondary-container">Linh
                                                hoạt ca</span>
                                        </div>
                                    </div>
                                    <div class="lg:self-center">
                                        <button
                                            class="w-full lg:w-auto px-2xl py-md bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-container shadow-sm active:scale-[0.98] transition-all">Ứng
                                            tuyển</button>
                                    </div>
                                </div>
                            </article>
                            {/* <!-- Job Card 3 --> */}
                            <article
                                class="group bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 relative overflow-hidden">
                                <div class="flex flex-col lg:flex-row gap-lg">
                                    <div
                                        class="h-16 w-16 min-w-[64px] bg-white rounded-xl border border-outline-variant flex items-center justify-center p-sm shadow-inner">
                                        <img alt="Company logo"
                                            data-alt="A modern corporate logo with a bold, sans-serif initial 'S' in vibrant orange and navy blue. The logo is rendered in a high-contrast, professional style with subtle gradients that give it a 3D feel. The background is a clean white, lit by soft, bright professional studio lighting."
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuASGkq-N8FJ-isrP2W6AlVjMuT7EXlnkE_7qCXXneGydEkDL2VTjxW6L0inZBbXsJnUyDjkGUJItveGrztOyf8b1k4_dURq4NGWgGaO8m5YP0JpNRJVdUu6_hsWd_cxlEXigLZOj58er4MZs0QIcP_xvmJHncDBbKaPJNDfoRO-KAXRlmqarTM-1r3sXnKjUYcTETslh2wzXV6WY-RSYacTQA-lm8T4UrTmo6sdKBhI_97XtI5CGpWHcRQG1NmRe5BR8je2sPepCKKO" />
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <h3
                                                    class="font-headline-sm text-headline-sm group-hover:text-primary transition-colors mb-xs">
                                                    Gia sư Tiếng Anh Tiểu học</h3>
                                                <p class="text-body-sm text-secondary font-medium">Smart Kids Center</p>
                                            </div>
                                            <button class="p-xs text-outline hover:text-error transition-colors">
                                                <span class="material-symbols-outlined">favorite</span>
                                            </button>
                                        </div>
                                        <div class="flex flex-wrap gap-md mt-md text-on-surface-variant">
                                            <div class="flex items-center gap-xs">
                                                <span class="material-symbols-outlined text-lg text-primary">payments</span>
                                                <span class="text-body-sm font-bold text-on-surface">200k - 300k/buổi</span>
                                            </div>
                                            <div class="flex items-center gap-xs">
                                                <span class="material-symbols-outlined text-lg text-outline">location_on</span>
                                                <span class="text-body-sm">Đống Đa, Hà Nội</span>
                                            </div>
                                            <div class="flex items-center gap-xs">
                                                <span class="material-symbols-outlined text-lg text-outline">schedule</span>
                                                <span class="text-body-sm">Hôm qua</span>
                                            </div>
                                        </div>
                                        <div class="flex flex-wrap gap-sm mt-md">
                                            <span
                                                class="px-md py-xs bg-surface-container rounded-full text-label-sm text-on-secondary-container">Bằng
                                                cấp</span>
                                            <span
                                                class="px-md py-xs bg-surface-container rounded-full text-label-sm text-on-secondary-container">Làm
                                                việc tại nhà</span>
                                        </div>
                                    </div>
                                    <div class="lg:self-center">
                                        <button
                                            class="w-full lg:w-auto px-2xl py-md bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-container shadow-sm active:scale-[0.98] transition-all">Ứng
                                            tuyển</button>
                                    </div>
                                </div>
                            </article>
                            {/* <!-- Job Card 4 --> */}
                            <article
                                class="group bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 relative overflow-hidden">
                                <div class="flex flex-col lg:flex-row gap-lg">
                                    <div
                                        class="h-16 w-16 min-w-[64px] bg-white rounded-xl border border-outline-variant flex items-center justify-center p-sm shadow-inner">
                                        <img alt="Company logo"
                                            data-alt="A sophisticated logo for a marketing agency, using a sleek, stylized arrow and bar chart symbol in shades of emerald green and silver. The logo is presented on a textured paper-white background, lit with soft natural daylight to create a sense of trust, growth, and high-fidelity professional service."
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1I6fTEYENHIwcrTmi58D2E4rVy93Bc9_kXqg28qywhM56_CixKloRMrf9YH6kAh8wIgkHZx0FVCZMtJM7Ku2tfGnXquQvgoUD8ZOsyXab_HbfLF7ZbkH3U8NrUb4KSv8pd0gIxNw-VyLSjf12xbLNDpWPx1ZGlppnvQp1bs1M8zgEu30lLriUQKbottbMQ-JDABxQkEUWp3rIoDS3Y2_yzMandQ30bYw0EMcScfYvg2W9ys37iqnrOQLBtACq4ZvopKf6Xin5LKJw" />
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex justify-between items-start">
                                            <div>
                                                <h3
                                                    class="font-headline-sm text-headline-sm group-hover:text-primary transition-colors mb-xs">
                                                    Content Creator (Remote)</h3>
                                                <p class="text-body-sm text-secondary font-medium">Digital Pulse Agency</p>
                                            </div>
                                            <button class="p-xs text-outline hover:text-error transition-colors">
                                                <span class="material-symbols-outlined">favorite</span>
                                            </button>
                                        </div>
                                        <div class="flex flex-wrap gap-md mt-md text-on-surface-variant">
                                            <div class="flex items-center gap-xs">
                                                <span class="material-symbols-outlined text-lg text-primary">payments</span>
                                                <span class="text-body-sm font-bold text-on-surface">8tr - 12tr VNĐ</span>
                                            </div>
                                            <div class="flex items-center gap-xs">
                                                <span class="material-symbols-outlined text-lg text-outline">location_on</span>
                                                <span class="text-body-sm">Toàn quốc (Remote)</span>
                                            </div>
                                            <div class="flex items-center gap-xs">
                                                <span class="material-symbols-outlined text-lg text-outline">schedule</span>
                                                <span class="text-body-sm">3 ngày trước</span>
                                            </div>
                                        </div>
                                        <div class="flex flex-wrap gap-sm mt-md">
                                            <span
                                                class="px-md py-xs bg-surface-container rounded-full text-label-sm text-on-secondary-container">Sáng
                                                tạo</span>
                                            <span
                                                class="px-md py-xs bg-surface-container rounded-full text-label-sm text-on-secondary-container">Làm
                                                tự do</span>
                                        </div>
                                    </div>
                                    <div class="lg:self-center">
                                        <button
                                            class="w-full lg:w-auto px-2xl py-md bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-container shadow-sm active:scale-[0.98] transition-all">Ứng
                                            tuyển</button>
                                    </div>
                                </div>
                            </article>
                        </div>
                        {/* <!-- Modern Pagination --> */}
                        <nav class="mt-3xl flex justify-center items-center gap-sm">
                            <button
                                class="h-10 w-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">
                                <span class="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button
                                class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold">1</button>
                            <button
                                class="h-10 w-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">2</button>
                            <button
                                class="h-10 w-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">3</button>
                            <span class="px-sm text-outline">...</span>
                            <button
                                class="h-10 w-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">10</button>
                            <button
                                class="h-10 w-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">
                                <span class="material-symbols-outlined">chevron_right</span>
                            </button>
                        </nav>
                    </section>
                </div>
            </main>
        </>
    );
}