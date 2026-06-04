import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/atoms/Button";
import { navigateToSection, sectionHref } from "@/utils/sectionNavigation";
import navbarLogo from "../../assets/images/logo.png";
import { FEATURE_FLAGS } from "../../config/featureFlags";

export function Navbar() {
	const { t, i18n } = useTranslation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const menuTriggerRef = useRef<HTMLButtonElement>(null);
	const mobileMenuRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const isFirstRender = useRef(true);

	const openMobileMenu = (): void => {
		const mobileMenu = mobileMenuRef.current;
		if (mobileMenu && "showPopover" in mobileMenu) {
			mobileMenu.showPopover();
		}
		setIsMenuOpen(true);
	};

	const closeMobileMenu = (): void => {
		const mobileMenu = mobileMenuRef.current;
		if (mobileMenu?.matches(":popover-open")) {
			mobileMenu.hidePopover();
		}
		setIsMenuOpen(false);
	};

	const toggleMobileMenu = (): void => {
		if (isMenuOpen) {
			closeMobileMenu();
		} else {
			openMobileMenu();
		}
	};

	const toggleLanguage = () => {
		const nextLng = i18n.language === "nl" ? "en" : "nl";
		i18n.changeLanguage(nextLng);
	};

	const handleSectionClick =
		(sectionId: string): React.MouseEventHandler<HTMLAnchorElement> =>
		(event) => {
			event.preventDefault();
			navigateToSection(sectionId);
		};

	const handleMobileSectionClick =
		(sectionId: string): React.MouseEventHandler<HTMLAnchorElement> =>
		(event) => {
			event.preventDefault();
			closeMobileMenu();
			navigateToSection(sectionId);
		};

	useEffect(() => {
		const mobileMenu = mobileMenuRef.current;
		if (!mobileMenu) return;

		const handleToggle = () => {
			setIsMenuOpen(mobileMenu.matches(":popover-open"));
		};

		mobileMenu.addEventListener("toggle", handleToggle);
		return () => {
			mobileMenu.removeEventListener("toggle", handleToggle);
		};
	}, []);

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
							href={sectionHref("wie")}
							onClick={handleSectionClick("wie")}
							className="rounded-lg px-2 font-display text-sm text-white uppercase tracking-widest transition-all hover:scale-110 hover:text-pret-red focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
						>
							{t("navbar.band")}
						</a>
					)}
					{FEATURE_FLAGS.MEMBERS && (
						<a
							href={sectionHref("leden")}
							onClick={handleSectionClick("leden")}
							className="rounded-lg px-2 font-display text-sm text-white uppercase tracking-widest transition-all hover:scale-110 hover:text-pret-yellow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
						>
							{t("navbar.members")}
						</a>
					)}
					{FEATURE_FLAGS.AGENDA && (
						<a
							href={sectionHref("agenda")}
							onClick={handleSectionClick("agenda")}
							className="rounded-lg px-2 font-display text-sm text-white uppercase tracking-widest transition-all hover:scale-110 hover:text-pret-red focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
						>
							{t("navbar.when")}
						</a>
					)}
					{FEATURE_FLAGS.CONTACT && (
						<Button
							className="book-now"
							href={sectionHref("contact")}
							onClick={handleSectionClick("contact")}
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
				ref={mobileMenuRef}
				id="mobile-menu"
				popover="auto"
				className={`fixed inset-0 z-60 m-0 h-auto max-h-none w-auto max-w-none border-0 p-0 flex-col items-center justify-center space-y-8 bg-pret-red/95 backdrop-blur-xl transition-transform duration-500 open:flex ${isMenuOpen ? "flex translate-x-0" : "translate-x-full"}`}
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
					<a
						href={sectionHref("wie")}
						className="font-display text-5xl text-white transition-colors hover:text-pret-yellow focus-visible:text-pret-yellow"
						onClick={handleMobileSectionClick("wie")}
					>
						{t("navbar.band")}
					</a>
				)}
				{FEATURE_FLAGS.MEMBERS && (
					<a
						href={sectionHref("leden")}
						className="font-display text-5xl text-white transition-colors hover:text-pret-yellow focus-visible:text-pret-yellow"
						onClick={handleMobileSectionClick("leden")}
					>
						{t("navbar.members")}
					</a>
				)}
				{FEATURE_FLAGS.AGENDA && (
					<a
						href={sectionHref("agenda")}
						className="font-display text-5xl text-white transition-colors hover:text-pret-yellow focus-visible:text-pret-yellow"
						onClick={handleMobileSectionClick("agenda")}
					>
						{t("navbar.when")}
					</a>
				)}
				{FEATURE_FLAGS.CONTACT && (
					<a
						href={sectionHref("contact")}
						className="book-now font-display text-5xl text-white transition-colors hover:text-pret-yellow focus-visible:text-pret-yellow"
						onClick={handleMobileSectionClick("contact")}
					>
						{t("navbar.book_now")}
					</a>
				)}
				<Button
					variant="outline"
					size="lg"
					onClick={() => {
						toggleLanguage();
						closeMobileMenu();
					}}
					className="border-4 border-white text-white hover:bg-white hover:text-pret-red"
				>
					{i18n.language === "nl" ? "ENGLISH" : "NEDERLANDS"}
				</Button>
			</div>
		</>
	);
}
