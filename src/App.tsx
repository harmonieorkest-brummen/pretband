import confetti from "canvas-confetti";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBasinAhoy } from "./analytics/useBasinAhoy";
import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { BackgroundLayer } from "./components/ui/BackgroundLayer";
import { ErrorBoundary } from "./components/ui/molecules/ErrorBoundary";
import { publicEnv } from "./config/publicEnv";
import { EasterEggProvider, useEasterEggs } from "./context/EasterEggContext";
import { Heading } from "./components/ui/atoms/Heading";
import { Button } from "./components/ui/atoms/Button";

declare global {
	interface Window {
		Cookiebot?: {
			renew: () => void;
			consent?: {
				statistics: boolean;
			};
		};
	}
}

// Lazy load components that are not in the initial viewport
const About = lazy(() =>
	import("./components/About").then((m) => ({ default: m.About })),
);
const Agenda = lazy(() =>
	import("./components/Agenda").then((m) => ({ default: m.Agenda })),
);
const Contact = lazy(() =>
	import("./components/Contact").then((m) => ({ default: m.Contact })),
);
const Members = lazy(() =>
	import("./components/Members").then((m) => ({ default: m.Members })),
);
const Highlights = lazy(() =>
	import("./components/Highlights").then((m) => ({ default: m.Highlights })),
);
const Footer = lazy(() =>
	import("./components/Footer").then((m) => ({ default: m.Footer })),
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
		<div className="fixed inset-0 z-500 flex items-center justify-center bg-pret-dark/95 p-6 backdrop-blur-xl animate-fade-in">
			<div className="max-w-2xl text-center">
				<Heading level={1} variant="yellow" className="mb-8 animate-bounce text-7xl md:text-9xl">
					LEGEND!
				</Heading>
				<p className="mb-12 font-body text-2xl leading-relaxed text-white md:text-4xl">
					You found all the hidden secrets. You are now an honorary member of the chaos!
				</p>
				<Button onClick={() => setShow(false)} variant="primary" size="xl" className="shadow-[0_20px_0_#9d2423]">
					CONTINUE THE PARTY
				</Button>
				<button 
					type="button"
					onClick={() => { resetEggs(); setShow(false); }}
					className="mt-12 block w-full text-center font-body text-white/30 underline transition-colors hover:text-white"
				>
					Reset and find them again?
				</button>
			</div>
		</div>
	);
}

function App() {
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
		return () => {
			if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
		};
	}, []);

	const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		document.title = t("title");
		document.documentElement.lang = i18n.language;
	}, [t, i18n.language]);

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

	const launchConfetti = (): void => {
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
	};

	useEffect(() => {
		// Fire initial confetti on load
		const timer = setTimeout(() => {
			launchConfetti();
		}, 500);

		return () => {
			clearTimeout(timer);
		};
	});

	return (
		<EasterEggProvider>
			<AchievementOverlay />
			<BackgroundLayer />
			<div className="relative min-h-screen font-body text-white selection:bg-pret-yellow selection:text-pret-dark">
				{/* Party Backdrop */}
				<div
					className="pointer-events-none fixed inset-0 z-100 bg-noise"
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
					<Suspense fallback={<SectionLoader height="h-[400px]" />}>
						<About />
					</Suspense>
					<Suspense fallback={<SectionLoader height="h-[600px]" />}>
						<Members />
					</Suspense>
					<Suspense fallback={<SectionLoader height="h-[600px]" />}>
						<Highlights />
					</Suspense>
					<Suspense fallback={<SectionLoader height="h-[400px]" />}>
						<ErrorBoundary>
							<Agenda />
						</ErrorBoundary>
					</Suspense>
					<Suspense fallback={<SectionLoader height="h-[500px]" />}>
						<ErrorBoundary>
							<Contact />
						</ErrorBoundary>
					</Suspense>
				</main>

				<Suspense fallback={null}>
					<Footer
						onOpenPrivacy={() => window.Cookiebot?.renew()}
					/>
				</Suspense>
			</div>
		</EasterEggProvider>
	);
}

export default App;
