export default function Profile() {
    return (
        <>
            <main class="max-w-container-max mx-auto px-gutter py-xl">
                {/* <!-- Hero Header --> */}
                <section
                    class="bg-surface-container-lowest rounded-xl p-2xl shadow-sm mb-xl border border-outline-variant relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-primary-fixed/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div class="flex flex-col md:flex-row items-center md:items-start gap-xl relative z-10">
                        <div class="relative">
                            <div
                                class="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-surface shadow-md">
                                <img alt="Avatar" class="w-full h-full object-cover"
                                    data-alt="Close up portrait of a young adult Vietnamese student, smiling genuinely at the camera. He is outdoors in a bright, airy environment with lush green university courtyard elements in the far background. The visual style is high-fidelity, professional, and optimistic, utilizing soft focus and natural daylight to highlight his friendly features."
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTIVee-iR7p3lNuY0A1yon0b6EolEwxEvRAHzL_lsgqabaKxSqvJ0bRzA4XMviOfnJLbte0FT7nt_rFd_Lm3hQzggmTImX_WxW0MZymPr7hOzXb82lV7VtQlwIKTcKpdgGubGLoLWnVzoxh2XJWhJA-z5vuv9XTAXjLBCO_3peR4VFU5TWQ58GSQHdUKAelYu0gLFXK1vj7YWuZzuZL70gct7EIwy49U59JnL8TXnZUNmc8pGlLWsqeJ8KzN65HzD0L_HrkG7hduMu" />
                            </div>
                            <button
                                class="absolute bottom-2 right-2 bg-primary text-on-primary p-xs rounded-lg shadow-lg hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-[18px]" data-icon="photo_camera">photo_camera</span>
                            </button>
                        </div>
                        <div class="flex-1 text-center md:text-left">
                            <h1 class="font-display text-display text-on-surface mb-xs">Nguyễn Minh Quân</h1>
                            <p class="font-headline-sm text-on-surface-variant mb-sm">Sinh viên năm 3 - Đại học Kinh tế</p>
                            <div
                                class="flex flex-wrap justify-center md:justify-start gap-md text-on-surface-variant font-label-md">
                                <span class="flex items-center gap-xs">
                                    <span class="material-symbols-outlined text-[20px]"
                                        data-icon="location_on">location_on</span>
                                    Quận 3, TP. Hồ Chí Minh
                                </span>
                                <span class="flex items-center gap-xs">
                                    <span class="material-symbols-outlined text-[20px]"
                                        data-icon="verified_user">verified_user</span>
                                    Đã xác thực hồ sơ
                                </span>
                            </div>
                        </div>
                        <div class="mt-lg md:mt-0">
                            <button
                                class="bg-primary text-on-primary font-label-md px-xl py-md rounded-xl shadow-sm hover:translate-y-[-2px] transition-all flex items-center gap-sm">
                                <span class="material-symbols-outlined" data-icon="edit">edit</span>
                                Chỉnh sửa hồ sơ
                            </button>
                        </div>
                    </div>
                </section>
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-xl">
                    {/* <!-- Sidebar --> */}
                    <aside class="lg:col-span-4 space-y-xl">
                        {/* <!-- Contact Info --> */}
                        <div class="bg-surface-container-low rounded-xl p-lg border border-outline-variant shadow-sm">
                            <h3 class="font-headline-sm text-on-surface mb-lg">Thông tin liên hệ</h3>
                            <div class="space-y-md">
                                <div class="flex items-center gap-md">
                                    <div
                                        class="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-outline-variant">
                                        <span class="material-symbols-outlined text-primary" data-icon="mail">mail</span>
                                    </div>
                                    <div>
                                        <p class="text-label-sm text-on-surface-variant">Email</p>
                                        <p class="font-label-md">quan.nguyen@student.ueh.edu.vn</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-md">
                                    <div
                                        class="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-outline-variant">
                                        <span class="material-symbols-outlined text-primary" data-icon="call">call</span>
                                    </div>
                                    <div>
                                        <p class="text-label-sm text-on-surface-variant">Số điện thoại</p>
                                        <p class="font-label-md">090 123 4567</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-md">
                                    <div
                                        class="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-outline-variant">
                                        <span class="material-symbols-outlined text-primary" data-icon="link">link</span>
                                    </div>
                                    <div>
                                        <p class="text-label-sm text-on-surface-variant">Social link</p>
                                        <p class="font-label-md text-primary">linkedin.com/in/quan-nguyen</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <!-- Skills Section --> */}
                        <div class="bg-surface-container-low rounded-xl p-lg border border-outline-variant shadow-sm">
                            <div class="flex justify-between items-center mb-lg">
                                <h3 class="font-headline-sm text-on-surface">Kỹ năng</h3>
                                <span
                                    class="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                                    data-icon="add_circle">add_circle</span>
                            </div>
                            <div class="flex flex-wrap gap-sm">
                                <span
                                    class="bg-primary-fixed text-on-primary-fixed px-md py-sm rounded-lg font-label-md">Marketing</span>
                                <span
                                    class="bg-primary-fixed text-on-primary-fixed px-md py-sm rounded-lg font-label-md">English
                                    (IELTS 7.5)</span>
                                <span
                                    class="bg-primary-fixed text-on-primary-fixed px-md py-sm rounded-lg font-label-md">Microsoft
                                    Office</span>
                                <span
                                    class="bg-primary-fixed text-on-primary-fixed px-md py-sm rounded-lg font-label-md">Canva</span>
                                <span class="bg-primary-fixed text-on-primary-fixed px-md py-sm rounded-lg font-label-md">Public
                                    Speaking</span>
                            </div>
                        </div>
                        {/* <!-- Preferred Categories --> */}
                        <div class="bg-surface-container-low rounded-xl p-lg border border-outline-variant shadow-sm">
                            <h3 class="font-headline-sm text-on-surface mb-lg">Lĩnh vực quan tâm</h3>
                            <div class="flex flex-wrap gap-sm">
                                <span
                                    class="bg-surface text-secondary-fixed-dim border border-outline-variant px-md py-sm rounded-lg font-label-md text-on-surface">Digital
                                    Marketing</span>
                                <span
                                    class="bg-surface text-secondary-fixed-dim border border-outline-variant px-md py-sm rounded-lg font-label-md text-on-surface">Content
                                    Writing</span>
                                <span
                                    class="bg-surface text-secondary-fixed-dim border border-outline-variant px-md py-sm rounded-lg font-label-md text-on-surface">Gia
                                    sư Tiếng Anh</span>
                                <span
                                    class="bg-surface text-secondary-fixed-dim border border-outline-variant px-md py-sm rounded-lg font-label-md text-on-surface">Sáng
                                    tạo nội dung</span>
                            </div>
                        </div>
                    </aside>
                    {/* <!-- Main Content Area --> */}
                    <div class="lg:col-span-8">
                        {/* <!-- Tabs --> */}
                        <div
                            class="flex border-b border-outline-variant mb-lg gap-xl overflow-x-auto whitespace-nowrap scrollbar-hide">
                            <button class="pb-md px-xs font-label-md text-primary border-b-2 border-primary">
                                Công việc đã lưu
                            </button>
                            <button
                                class="pb-md px-xs font-label-md text-on-surface-variant hover:text-primary transition-colors">
                                Công việc đã ứng tuyển
                            </button>
                            <button
                                class="pb-md px-xs font-label-md text-on-surface-variant hover:text-primary transition-colors">
                                Hoạt động gần đây
                            </button>
                        </div>
                        {/* <!-- Job Grid --> */}
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
                            {/* <!-- Job Card 1 --> */}
                            <div
                                class="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-all group">
                                <div class="flex justify-between items-start mb-md">
                                    <div
                                        class="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden border border-outline-variant">
                                        <img alt="Logo" class="w-full h-full object-cover"
                                            data-alt="A minimalist tech company logo featuring sleek typography and a stylized geometric 'V' in primary blue. The background is a clean, slightly textured off-white surface, shot in high-definition studio lighting. It conveys innovation and professional reliability for a modern digital workspace."
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0sPYDlHijTGPGc9PM8KL02SmD-_xWIzlsj7SvIqfoAxJMHBtnX1sXsdPZizXsaSNQwk01tM3LRGHfuNCOk1jS91pSOfqaXuibpNWJq6cJHWMHs0F-gQKVUiB_d5y-06wSDlw4M7FPgcGmzh0IlO-WYC9yq7qzzKqjgUDJl_qBBDqKIxXolaaegLFBV4MTLX9uap_7Eh1GwHZQUIf2uqt_4buuuEh8z2Kc3D74HC8J72oPNBxM-8N7SUvwuRIa9-PSNdIWPKf4E_G3" />
                                    </div>
                                    <button class="text-primary">
                                        <span class="material-symbols-outlined" data-icon="bookmark"
                                            data-weight="fill">bookmark</span>
                                    </button>
                                </div>
                                <h4 class="font-headline-sm text-on-surface mb-xs group-hover:text-primary transition-colors">
                                    Cộng tác viên Marketing</h4>
                                <p class="text-body-sm text-on-surface-variant mb-lg">VNG Corporation • Quận 7</p>
                                <div class="flex flex-wrap gap-xs mb-xl">
                                    <span
                                        class="bg-secondary-container text-on-secondary-container px-sm py-[2px] rounded text-label-sm">Part-time</span>
                                    <span
                                        class="bg-surface-container text-on-surface-variant px-sm py-[2px] rounded text-label-sm">7tr
                                        - 10tr</span>
                                </div>
                                <button
                                    class="w-full bg-primary text-on-primary py-md rounded-lg font-label-md hover:bg-primary-container transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    Ứng tuyển ngay
                                </button>
                            </div>
                            {/* <!-- Job Card 2 --> */}
                            <div
                                class="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-all group">
                                <div class="flex justify-between items-start mb-md">
                                    <div
                                        class="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden border border-outline-variant">
                                        <img alt="Logo" class="w-full h-full object-cover"
                                            data-alt="Modern branding for a creative agency, featuring an abstract colorful bird icon on a dark blue background. The style is minimalist and vibrant, with a focus on clean lines and bold color contrast. This logo represents a high-energy creative environment."
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBR89pHbljxbh8Ra2D7PoFmGVIG-Vc23DMOzK5ZxBS97vC_8YK7mhCNaAROmPVcun86mVUcp3YWP1_dMg3rSDXOjm7dvf0vUmU8k1rYRj_0Xje_2veWzb1YuSKt-RZcBsEMdd8QSsZ_jKlmOJ-MSueaatGrZ-0kpLap2_35QH52Vq4-5fzGJOvpnYg-ViweS3zrnpgn3zHd1cSuGxoDtbLpN44ugXntmGaT9bdxBLNUevimhkUdu6vZxn4dqILHCybymqmfkiZ4KzRd" />
                                    </div>
                                    <button class="text-primary">
                                        <span class="material-symbols-outlined" data-icon="bookmark"
                                            data-weight="fill">bookmark</span>
                                    </button>
                                </div>
                                <h4 class="font-headline-sm text-on-surface mb-xs group-hover:text-primary transition-colors">
                                    Social Media Intern</h4>
                                <p class="text-body-sm text-on-surface-variant mb-lg">Be Creative Agency • Quận 1</p>
                                <div class="flex flex-wrap gap-xs mb-xl">
                                    <span
                                        class="bg-secondary-container text-on-secondary-container px-sm py-[2px] rounded text-label-sm">Thực
                                        tập</span>
                                    <span
                                        class="bg-surface-container text-on-surface-variant px-sm py-[2px] rounded text-label-sm">Thỏa
                                        thuận</span>
                                </div>
                                <button
                                    class="w-full bg-primary text-on-primary py-md rounded-lg font-label-md hover:bg-primary-container transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    Ứng tuyển ngay
                                </button>
                            </div>
                            {/* <!-- Job Card 3 --> */}
                            <div
                                class="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-all group">
                                <div class="flex justify-between items-start mb-md">
                                    <div
                                        class="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden border border-outline-variant">
                                        <img alt="Logo" class="w-full h-full object-cover"
                                            data-alt="An elegant emblem for an educational center, showcasing an open book and a stylized torch. The design uses muted gold and navy blue tones, creating an aura of academic excellence and prestige. Shot in soft studio light for a clean finish."
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0kYwkIZD4kZh3a1ediSi6W7rXAPBi_Zlp36g_2Do024bRIgbmhpIHYB_qtFB52gf1CgtukRJ96wYNkHkEW0PcG4HFPJMZz9lGeQ1UEM_0Da9yuw9G0mkp6TphvVkP6kHaiNXbAVSDlXnNxJ8bDhLlgyNzsP3ExpnmjYJpuMT4I-EjxoosPePkaHH55wgWwwpt2-uzf0apJmQdBcRfv2wda5c6urt069XhrMVgM8_IsZH6ev9gWXyVdBHA2Hi1ZJri2Q5HV6hIP8u7" />
                                    </div>
                                    <button class="text-primary">
                                        <span class="material-symbols-outlined" data-icon="bookmark"
                                            data-weight="fill">bookmark</span>
                                    </button>
                                </div>
                                <h4 class="font-headline-sm text-on-surface mb-xs group-hover:text-primary transition-colors">
                                    Gia sư Tiếng Anh IELTS</h4>
                                <p class="text-body-sm text-on-surface-variant mb-lg">The IELTS Workshop • Quận 3</p>
                                <div class="flex flex-wrap gap-xs mb-xl">
                                    <span
                                        class="bg-secondary-container text-on-secondary-container px-sm py-[2px] rounded text-label-sm">Tự
                                        do</span>
                                    <span
                                        class="bg-surface-container text-on-surface-variant px-sm py-[2px] rounded text-label-sm">150k
                                        - 250k/h</span>
                                </div>
                                <button
                                    class="w-full bg-primary text-on-primary py-md rounded-lg font-label-md hover:bg-primary-container transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    Ứng tuyển ngay
                                </button>
                            </div>
                            {/* <!-- Add New Card --> */}
                            <div
                                class="border-2 border-dashed border-outline-variant p-lg rounded-xl flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer min-h-[220px]">
                                <span class="material-symbols-outlined text-display mb-md" data-icon="search">search</span>
                                <p class="font-label-md">Tìm kiếm thêm cơ hội mới</p>
                                <p class="text-body-sm">Khám phá hàng ngàn việc làm bán thời gian</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}