export default function Footer() {
    return (
        <>
            <footer class="w-full mt-3xl border-t border-outline-variant bg-surface-container-highest">
                <div
                    class="flex flex-col md:flex-row justify-between items-center py-xl px-gutter max-w-container-max mx-auto">
                    <div class="mb-md md:mb-0">
                        <span class="font-display text-headline-sm font-bold text-primary">JobFlow</span>
                        <p class="font-body-sm text-on-surface-variant mt-xs">© 2024 JobFlow. Empowering students and
                            freelancers.</p>
                    </div>
                    <div class="flex gap-xl">
                        <a class="font-body-sm text-on-surface-variant hover:text-primary transition-colors"
                            href="#">About</a>
                        <a class="font-body-sm text-on-surface-variant hover:text-primary transition-colors"
                            href="#">Privacy</a>
                        <a class="font-body-sm text-on-surface-variant hover:text-primary transition-colors"
                            href="#">Terms</a>
                        <a class="font-body-sm text-on-surface-variant hover:text-primary transition-colors"
                            href="#">Support</a>
                    </div>
                </div>
            </footer>
        </>
    );
}