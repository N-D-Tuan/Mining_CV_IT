import { Link } from "react-router-dom";

export default function Header() {
    return (
        <>
            <header
                class="bg-surface dark:bg-surface-dim docked full-width top-0 sticky z-50 border-b border-outline-variant dark:border-outline shadow-sm h-[64px]">
                <div class="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-full">
                    <div class="flex items-center gap-xl">
                        <Link to="/">
                            <span class="font-display text-headline-md font-bold text-primary dark:text-primary-fixed-dim">JobFlow</span>
                        </Link>
                        <nav class="hidden md:flex items-center gap-lg">
                            <Link to="/browse">
                                <span class="text-on-surface-variant dark:text-on-surface-variant font-medium font-headline-sm text-headline-sm hover:text-primary-container transition-all">Browse</span>
                            </Link>
                            <Link to="/">
                                <span class="text-on-surface-variant dark:text-on-surface-variant font-medium font-headline-sm text-headline-sm hover:text-primary-container transition-all">Dashboard</span>
                            </Link>
                            <Link to="/profile">
                                <span class="text-on-surface-variant dark:text-on-surface-variant font-medium font-headline-sm text-headline-sm hover:text-primary-container transition-all">Profile</span>
                            </Link>
                        </nav>
                    </div>
                    <div class="flex items-center gap-md">
                        <button class="p-sm text-on-surface-variant hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">notifications</span>
                        </button>
                        <button class="p-sm text-on-surface-variant hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">settings</span>
                        </button>
                        <div class="h-10 w-10 rounded-full overflow-hidden border border-outline-variant">
                            <Link to="/profile">
                                <img alt="User profile"
                                    data-alt="A professional headshot of a smiling young adult male with short groomed hair and a confident expression. He is wearing a clean white shirt against a neutral, softly blurred office background with warm natural lighting, conveying a professional and approachable corporate persona."
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCArYmU7Q68etRKOwGnvYoBMN4qsrdHwhnoRvQWQpSgMmK7_BsggJn6urIO8NrnGj9iQndC8Zz44Sr9vYjxlcmxa-o-LvCFK7TiBciroLIBqwqBbR68oVH2S7_brpYRYLOO6xF2uW6wkQ9Paf3mrmfObXgLla2huxdiMSTa1XPQE7CoWrG0Wr-6s5uAOZPpo7COHgp1JnS9Vn577USsjiLVvCzKX7X-iq3BB8BljOJ4VqHzqOkYBnpSHbWl9p7eeHECgCHqxop1vrFS" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}