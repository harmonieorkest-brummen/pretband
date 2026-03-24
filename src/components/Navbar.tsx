import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import navbarLogo from "../assets/images/logo.png";
import { FEATURE_FLAGS } from "../config/featureFlags";
import { Button } from "./ui/atoms/Button";

export function Navbar() {
	const { t, i18n } = useTranslation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const menuTriggerRef = useRef<HTMLButtonElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const isFirstRender = useRef(true);

	const toggleMobileMenu = (): void => {
		setIsMenuOpen(!isMenuOpen);
	};

	const toggleLanguage = () => {
		const nextLng = i18n.language === "nl" ? "en" : "nl";
		i18n.changeLanguage(nextLng);
	};

	// Focus management for accessibility
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		if (isMenuOpen) {
			// Focus the close button when menu opens
			closeButtonRef.current?.focus();
		} else {
			// Focus the trigger button when menu closes
			menuTriggerRef.current?.focus();
		}
	}, [isMenuOpen]);

	return (
		<>
			{/* Navigation */}
			<nav className="fixed top-6 left-1/2 z-50 flex w-[95%] -translate-x-1/2 items-center justify-between rounded-2xl border border-white/20 bg-pret-dark/80 px-6 py-3 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all md:w-auto">
				<a
					href="./"
					className="group mr-12 flex items-center space-x-3 rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
					aria-label={t("navbar.band")}
				>
					<img
						src={navbarLogo}
						alt="Logo"
						width="48"
						height="48"
						className="h-12 w-auto rounded-full transition-transform duration-300 group-hover:rotate-12"
					/>
				</a>
				<div className="hidden items-center space-x-10 md:flex">
					{FEATURE_FLAGS.ABOUT && (
						<a
							href="#wie"
							className="rounded-lg px-2 font-display text-sm text-white uppercase tracking-widest transition-all hover:scale-110 hover:text-pret-red focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
						>
							{t("navbar.band")}
						</a>
					)}
					{FEATURE_FLAGS.MEMBERS && (
						<a
							href="#leden"
							className="rounded-lg px-2 font-display text-sm text-white uppercase tracking-widest transition-all hover:scale-110 hover:text-pret-yellow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
						>
							{t("navbar.members")}
						</a>
					)}
					{FEATURE_FLAGS.AGENDA && (
						<a
							href="#agenda"
							className="rounded-lg px-2 font-display text-sm text-white uppercase tracking-widest transition-all hover:scale-110 hover:text-pret-red focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
						>
							{t("navbar.when")}
						</a>
					)}
					{FEATURE_FLAGS.CONTACT && (
						<Button
							className="book-now"
							href="#contact"
							variant="secondary"
							size="md"
						>
							{t("navbar.book_now")}
						</Button>
					)}
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
					ref={menuTriggerRef}
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
				inert={!isMenuOpen}
			>
				<button
					ref={closeButtonRef}
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
				{FEATURE_FLAGS.ABOUT && (
					<button
						type="button"
						className="font-display text-5xl text-white transition-colors hover:text-pret-yellow focus-visible:text-pret-yellow"
						onClick={() => {
							toggleMobileMenu();
							window.location.href = "./#wie";
						}}
					>
						{t("navbar.band")}
					</button>
				)}
				{FEATURE_FLAGS.MEMBERS && (
					<button
						type="button"
						className="font-display text-5xl text-white transition-colors hover:text-pret-yellow focus-visible:text-pret-yellow"
						onClick={() => {
							toggleMobileMenu();
							window.location.href = "./#leden";
						}}
					>
						{t("navbar.members")}
					</button>
				)}
				{FEATURE_FLAGS.AGENDA && (
					<button
						type="button"
						className="font-display text-5xl text-white transition-colors hover:text-pret-yellow focus-visible:text-pret-yellow"
						onClick={() => {
							toggleMobileMenu();
							window.location.href = "./#agenda";
						}}
					>
						{t("navbar.when")}
					</button>
				)}
				{FEATURE_FLAGS.CONTACT && (
					<button
						type="button"
						className="book-now font-display text-5xl text-white transition-colors hover:text-pret-yellow focus-visible:text-pret-yellow"
						onClick={() => {
							toggleMobileMenu();
							window.location.href = "./#contact";
						}}
					>
						{t("navbar.book_now")}
					</button>
				)}
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
