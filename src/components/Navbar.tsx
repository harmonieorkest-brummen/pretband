import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/atoms/Button";

export function Navbar() {
	const { t, i18n } = useTranslation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMobileMenu = (): void => {
		setIsMenuOpen(!isMenuOpen);
	};

	const toggleLanguage = () => {
		const nextLng = i18n.language === "nl" ? "en" : "nl";
		i18n.changeLanguage(nextLng);
	};

	return (
		<>
			{/* Navigation */}
			<nav className="fixed top-6 left-1/2 z-50 flex w-[95%] -translate-x-1/2 items-center justify-between rounded-2xl border border-white/20 bg-pret-dark/80 px-6 py-3 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all md:w-auto">
				<a
					href={location.origin}
					className="group mr-12 flex items-center space-x-3 rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
					aria-label={t("navbar.band")}
				>
					<img
						src="/logo.png"
						alt="Logo"
						className="h-12 w-auto rounded-full transition-transform duration-300 group-hover:rotate-12"
					/>
				</a>
				<div className="hidden items-center space-x-10 md:flex">
					<a
						href="#wie"
						className="rounded-lg px-2 font-display text-sm text-white uppercase tracking-widest transition-all hover:scale-110 hover:text-pret-red focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
					>
						{t("navbar.band")}
					</a>
					<a
						href="#leden"
						className="rounded-lg px-2 font-display text-sm text-white uppercase tracking-widest transition-all hover:scale-110 hover:text-pret-yellow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
					>
						{t("navbar.members")}
					</a>
					<a
						href="#agenda"
						className="rounded-lg px-2 font-display text-sm text-white uppercase tracking-widest transition-all hover:scale-110 hover:text-pret-red focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
					>
						{t("navbar.when")}
					</a>
					<Button href="#contact" variant="secondary" size="md">
						{t("navbar.book_now")}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={toggleLanguage}
						className="px-2 py-1"
					>
						{i18n.language === "nl" ? "EN" : "NL"}
					</Button>
				</div>
				<button
					type="button"
					className="rounded-lg p-2 text-white transition-colors hover:text-pret-yellow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow md:hidden"
					onClick={toggleMobileMenu}
					aria-label={
						isMenuOpen ? t("navbar.close_menu") : t("navbar.open_menu")
					}
					aria-expanded={isMenuOpen}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<title>Menu</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="3"
							d="M4 6h16M4 12h16m-7 6h7"
						/>
					</svg>
				</button>
			</nav>

			{/* Mobile Menu (Chaos style) */}
			<div
				id="mobile-menu"
				className={`fixed inset-0 z-60 flex flex-col items-center justify-center space-y-8 bg-pret-red/95 backdrop-blur-xl transition-transform duration-500 ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
				aria-hidden={!isMenuOpen}
			>
				<button
					type="button"
					className="absolute top-8 right-8 rounded-full p-2 text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
					onClick={toggleMobileMenu}
					aria-label={t("navbar.close_menu")}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-12 w-12"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<title>Close Menu</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="3"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
				<a
					href={`${location.origin}#wie`}
					className="font-display text-5xl text-white transition-colors hover:text-pret-yellow focus-visible:text-pret-yellow"
					onClick={toggleMobileMenu}
				>
					{t("navbar.band")}
				</a>
				<a
					href={`${location.origin}#leden`}
					className="font-display text-5xl text-white transition-colors hover:text-pret-yellow focus-visible:text-pret-yellow"
					onClick={toggleMobileMenu}
				>
					{t("navbar.members")}
				</a>
				<a
					href={`${location.origin}#agenda`}
					className="font-display text-5xl text-white transition-colors hover:text-pret-yellow focus-visible:text-pret-yellow"
					onClick={toggleMobileMenu}
				>
					{t("navbar.when")}
				</a>
				<a
					href={`${location.origin}#contact`}
					className="font-display text-5xl text-pret-yellow transition-colors hover:text-white focus-visible:text-white"
					onClick={toggleMobileMenu}
				>
					{t("navbar.book_now")}
				</a>
				<Button
					variant="outline"
					size="lg"
					onClick={() => {
						toggleLanguage();
						toggleMobileMenu();
					}}
					className="border-4 border-white text-white hover:bg-white hover:text-pret-red"
				>
					{i18n.language === "nl" ? "ENGLISH" : "NEDERLANDS"}
				</Button>
			</div>
		</>
	);
}
