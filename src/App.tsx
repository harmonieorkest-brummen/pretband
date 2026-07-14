import confetti from "canvas-confetti";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { trackEvent } from "@/utils/adminData";
import { useBasinAhoy } from "./analytics/useBasinAhoy";
import { Button } from "./components/ui/atoms/Button";
import { Heading } from "./components/ui/atoms/Heading";
import { BackgroundLayer } from "./components/ui/BackgroundLayer";
import { ErrorBoundary } from "./components/ui/molecules/ErrorBoundary";
import { FEATURE_FLAGS } from "./config/featureFlags";
import { publicEnv } from "./config/publicEnv";
import { DataProvider } from "./context/DataContext";
import { EasterEggProvider, useEasterEggs } from "./context/EasterEggContext";
import { ToastProvider } from "./context/ToastContext";
import {
	getSectionIdFromHash,
	scrollToSection,
} from "./utils/sectionNavigation";

declare global {
	interface Window {
		Cookiebot?: {
			renew: () => void;
			consent?: {
				statistics: boolean;
				marketing: boolean;
				preferences: boolean;
			};
		};
	}
}

// Lazy load components that are not in the initial viewport
const About = lazy(() =>
	import("./components/sections/About").then((m) => ({ default: m.About })),
);
const Agenda = lazy(() =>
	import("./components/sections/Agenda").then((m) => ({ default: m.Agenda })),
);
const Contact = lazy(() =>
	import("./components/sections/Contact").then((m) => ({ default: m.Contact })),
);
const Members = lazy(() =>
	import("./components/sections/Members").then((m) => ({ default: m.Members })),
);
const Highlights = lazy(() =>
	import("./components/sections/Highlights").then((m) => ({
		default: m.Highlights,
	})),
);
const Footer = lazy(() =>
	import("./components/layout/Footer").then((m) => ({ default: m.Footer })),
);
const Gallery = lazy(() =>
	import("./components/sections/Gallery").then((m) => ({ default: m.Gallery })),
);

function SectionLoader({ height = "h-40" }: { height?: string }) {
	return (
		<div className={`${height} w-full animate-pulse rounded-3xl bg-white/5`} />
	);
}

function AchievementOverlay() {
	const { isAllFound, resetEggs } = useEasterEggs();
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (isAllFound) {
			setShow(true);
			// Launch extra celebration confetti
			const colors = ["#E53433", "#EBB64D", "#ffffff"];
			confetti({
				particleCount: 500,
				spread: 160,
				origin: { y: 0.5 },
				colors: colors,
			});
		}
	}, [isAllFound]);

	if (!show) return null;

	return (
		<div className="fixed inset-0 z-500 flex animate-fade-in items-center justify-center bg-pret-dark/95 p-6 backdrop-blur-xl">
			<div className="max-w-2xl text-center">
				<Heading
					level={1}
					variant="yellow"
					className="mb-8 animate-bounce text-7xl md:text-9xl"
				>
					LEGEND!
				</Heading>
				<p className="mb-12 font-body text-2xl text-white leading-relaxed md:text-4xl">
					You found all the hidden secrets. You are now an honorary member of
					the chaos!
				</p>
				<Button
					onClick={() => setShow(false)}
					variant="primary"
					size="xl"
					className="shadow-[0_20px_0_#9d2423]"
				>
					CONTINUE THE PARTY
				</Button>
				<button
					type="button"
					onClick={() => {
						resetEggs();
						setShow(false);
					}}
					className="mt-12 block w-full text-center font-body text-white/30 underline transition-colors hover:text-white"
				>
					Reset and find them again?
				</button>
			</div>
		</div>
	);
}

const AdminPanel = lazy(() =>
	import("./pages/admin/AdminPage").then((m) => ({ default: m.default })),
);

function PublicSite() {
	const { t, i18n } = useTranslation();

	const basinFormId = publicEnv.basinFormId;

	const [hasConsent, setHasConsent] = useState(false);

	useEffect(() => {
		const updateConsent = () => {
			setHasConsent(!!window.Cookiebot?.consent?.statistics);
		};

		window.addEventListener("CookiebotOnAccept", updateConsent);
		window.addEventListener("CookiebotOnDecline", updateConsent);

		// Initial check in case it's already loaded
		updateConsent();

		return () => {
			window.removeEventListener("CookiebotOnAccept", updateConsent);
			window.removeEventListener("CookiebotOnDecline", updateConsent);
		};
	}, []);

	useBasinAhoy(basinFormId || "", hasConsent);

	useEffect(() => {
		document.title = t("title");
		document.documentElement.lang = i18n.language;

		const metaDesc = document.querySelector('meta[name="description"]');
		if (metaDesc) metaDesc.setAttribute("content", t("description"));

		const ogDesc = document.querySelector('meta[property="og:description"]');
		if (ogDesc) ogDesc.setAttribute("content", t("description"));

		const ogTitle = document.querySelector('meta[property="og:title"]');
		if (ogTitle) ogTitle.setAttribute("content", t("title"));

		const ogLocale = document.querySelector('meta[property="og:locale"]');
		if (ogLocale)
			ogLocale.setAttribute(
				"content",
				i18n.language === "nl" ? "nl_NL" : "en_US",
			);
	}, [i18n.language, t]);

	useEffect(() => {
		// Best-effort clickjacking defense for static hosting (headers are preferred).
		try {
			if (window.top && window.top !== window.self) {
				window.top.location.href = window.self.location.href;
			}
		} catch {
			// If cross-origin framed, we can't read top; at least avoid running sensitive UI in-frame.
			document.body.innerHTML = "";
		}
	}, []);

	useEffect(() => {
		const scrollFromHash = () => {
			const sectionId = getSectionIdFromHash();
			if (sectionId) {
				scrollToSection(sectionId, { behavior: "auto", attempts: 20 });
			}
		};

		scrollFromHash();
		window.addEventListener("hashchange", scrollFromHash);

		return () => {
			window.removeEventListener("hashchange", scrollFromHash);
		};
	}, []);

	const launchConfetti = useCallback((): void => {
		// Respect prefers-reduced-motion
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}

		const colors = ["#E53433", "#EBB64D", "#2A2324", "#ffffff"];
		confetti({
			particleCount: 150,
			spread: 70,
			origin: { y: 0.6 },
			colors: colors,
		});
		// Count the burst for the admin dashboard (fire-and-forget, anonymous).
		trackEvent("confetti");
	}, []);

	useEffect(() => {
		// Fire initial confetti on load
		const timer = setTimeout(() => {
			launchConfetti();
		}, 500);

		return () => {
			clearTimeout(timer);
		};
	}, [launchConfetti]);

	return (
		<>
			<BackgroundLayer />
			<div className="relative min-h-screen bg-pret-dark font-body text-white selection:bg-pret-yellow selection:text-pret-dark">
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[1000] focus:rounded-lg focus:bg-pret-yellow focus:px-4 focus:py-2 focus:font-display focus:text-pret-dark focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-white"
				>
					{t("common.skip_to_main", { defaultValue: "Skip to main content" })}
				</a>

				{/* Party Backdrop */}
				<div
					className="pointer-events-none fixed inset-0 z-[100] bg-noise"
					aria-hidden="true"
				></div>
				<div
					id="confetti-canvas"
					className="pointer-events-none fixed inset-0 z-90"
					aria-hidden="true"
				></div>

				<Navbar />

				<main id="main-content">
					<Hero onLaunchConfetti={launchConfetti} />
					{FEATURE_FLAGS.ABOUT && (
						<Suspense fallback={<SectionLoader height="h-[400px]" />}>
							<About />
						</Suspense>
					)}
					{FEATURE_FLAGS.MEMBERS && (
						<Suspense fallback={<SectionLoader height="h-[600px]" />}>
							<Members />
						</Suspense>
					)}
					{FEATURE_FLAGS.HIGHLIGHTS && (
						<Suspense fallback={<SectionLoader height="h-[600px]" />}>
							<Highlights />
						</Suspense>
					)}
					{FEATURE_FLAGS.GALLERY && (
						<Suspense fallback={<SectionLoader height="h-[600px]" />}>
							<Gallery />
						</Suspense>
					)}
					<Suspense fallback={<SectionLoader height="h-[400px]" />}>
						<ErrorBoundary>{FEATURE_FLAGS.AGENDA && <Agenda />}</ErrorBoundary>
					</Suspense>
					{FEATURE_FLAGS.CONTACT && (
						<Suspense fallback={<SectionLoader height="h-[500px]" />}>
							<ErrorBoundary>
								<Contact />
							</ErrorBoundary>
						</Suspense>
					)}
				</main>

				<Suspense fallback={null}>
					<Footer onOpenPrivacy={() => window.Cookiebot?.renew()} />
				</Suspense>
			</div>
		</>
	);
}

function App() {
	return (
		<DataProvider>
			<ToastProvider>
				<EasterEggProvider>
					<AchievementOverlay />
					<HashRouter>
						<Routes>
							<Route path="/" element={<PublicSite />} />
							<Route
								path="/admin/*"
								element={
									<Suspense fallback={<SectionLoader height="h-screen" />}>
										<AdminPanel />
									</Suspense>
								}
							/>
						</Routes>
					</HashRouter>
				</EasterEggProvider>
			</ToastProvider>
		</DataProvider>
	);
}

export default App;
