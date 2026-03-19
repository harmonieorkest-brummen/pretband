import confetti from "canvas-confetti";
import { Suspense, lazy, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useBasinAhoy } from "./analytics/useBasinAhoy";
import { useGtm } from "./analytics/useGtm";
import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { BackgroundLayer } from "./components/ui/BackgroundLayer";
import { AnalyticsConsentPopover } from "./components/ui/molecules/AnalyticsConsentPopover";
import { ErrorBoundary } from "./components/ui/molecules/ErrorBoundary";
import { publicEnv } from "./config/publicEnv";
import { useAnalyticsConsent } from "./privacy/useAnalyticsConsent";

// Lazy load components that are not in the initial viewport
const About = lazy(() => import("./components/About").then((m) => ({ default: m.About })));
const Agenda = lazy(() => import("./components/Agenda").then((m) => ({ default: m.Agenda })));
const Contact = lazy(() => import("./components/Contact").then((m) => ({ default: m.Contact })));
const Members = lazy(() => import("./components/Members").then((m) => ({ default: m.Members })));
const Footer = lazy(() => import("./components/Footer").then((m) => ({ default: m.Footer })));

function SectionLoader() {
	return <div className="h-40 w-full animate-pulse bg-white/5 rounded-3xl" />;
}

function App() {
	const { t, i18n } = useTranslation();

	const basinFormId = publicEnv.basinFormId;
	const gtmTagId = publicEnv.gtmTagId;
	const { consent, isOpen, open, close, grant, deny } = useAnalyticsConsent();
	const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useGtm(gtmTagId || "", consent === "granted");

	useEffect(() => {
		return () => {
			if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
		};
	}, []);

	useBasinAhoy(basinFormId || "", consent === "granted");

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
		<div className="relative min-h-screen bg-pret-dark font-body text-white selection:bg-pret-yellow selection:text-pret-dark">
			<BackgroundLayer />
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
				<Suspense fallback={<SectionLoader />}>
					<About />
				</Suspense>
				<Suspense fallback={<SectionLoader />}>
					<Members />
				</Suspense>
				<Suspense fallback={<SectionLoader />}>
					<ErrorBoundary>
						<Agenda />
					</ErrorBoundary>
				</Suspense>
				<Suspense fallback={<SectionLoader />}>
					<ErrorBoundary>
						<Contact />
					</ErrorBoundary>
				</Suspense>
			</main>

			<Suspense fallback={null}>
				<Footer onOpenPrivacy={open} />
			</Suspense>

			<AnalyticsConsentPopover
				isOpen={isOpen}
				consent={consent}
				onAccept={grant}
				onDecline={deny}
				onManageClose={close}
				onRevoke={() => {
					// Once analytics is loaded, fully disabling is best-effort client-side.
					// A reload ensures no more requests are sent from the in-memory tracker.
					deny();
					if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
					reloadTimerRef.current = setTimeout(() => location.reload(), 1);
				}}
			/>
		</div>
	);
}

export default App;
