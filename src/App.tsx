import confetti from "canvas-confetti";
import { lazy, Suspense, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useBasinAhoy } from "./analytics/useBasinAhoy";
import { useGtm } from "./analytics/useGtm";
import { Cookiebot } from "./components/Cookiebot";
import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { BackgroundLayer } from "./components/ui/BackgroundLayer";
import { ErrorBoundary } from "./components/ui/molecules/ErrorBoundary";
import { publicEnv } from "./config/publicEnv";

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
const Footer = lazy(() =>
	import("./components/Footer").then((m) => ({ default: m.Footer })),
);

function SectionLoader({ height = "h-40" }: { height?: string }) {
	return (
		<div className={`${height} w-full animate-pulse rounded-3xl bg-white/5`} />
	);
}

function App() {
	const { t, i18n } = useTranslation();

	const basinFormId = publicEnv.basinFormId;
	const gtmTagId = publicEnv.gtmTagId;
	const cookiebotId = publicEnv.cookiebotId;

	// In auto-blocking mode, we can just let the tags load; Cookiebot will block them
	// until the user has consented.
	useGtm(gtmTagId || "", true);
	useBasinAhoy(basinFormId || "", true);

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
		<>
			<BackgroundLayer />
			{cookiebotId && <Cookiebot cbid={cookiebotId} />}
			<div className="relative min-h-screen bg-pret-dark font-body text-white selection:bg-pret-yellow selection:text-pret-dark">
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
		</>
	);
}

export default App;
