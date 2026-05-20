export default function Footer() {
    return (
        <>
            <footer className="w-full mt-3xl border-t border-outline-variant bg-surface-container-highest">
                <div
                    className="flex flex-col md:flex-row justify-between items-center py-xl px-gutter max-w-container-max mx-auto">
                    <div className="mb-md md:mb-0">
                        <span className="font-display text-headline-sm font-bold text-primary">JobFlow</span>
                        <p className="font-body-sm text-on-surface-variant mt-xs">© 2024 JobFlow. Empowering students and
                            freelancers.</p>
                    </div>
                    <div className="flex gap-xl">
                        <a className="font-body-sm text-on-surface-variant hover:text-primary transition-colors"
                            href="/">About</a>
                        <a className="font-body-sm text-on-surface-variant hover:text-primary transition-colors"
                            href="/">Privacy</a>
                        <a className="font-body-sm text-on-surface-variant hover:text-primary transition-colors"
                            href="/">Terms</a>
                        <a className="font-body-sm text-on-surface-variant hover:text-primary transition-colors"
                            href="/">Support</a>
                    </div>
                </div>
            </footer>
        </>
    );
}