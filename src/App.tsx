import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useBasinAhoy } from "./analytics/useBasinAhoy";
import { useGtm } from "./analytics/useGtm";
import { About } from "./components/About";
import { Agenda } from "./components/Agenda";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Members } from "./components/Members";
import { Navbar } from "./components/Navbar";
import { BackgroundLayer } from "./components/ui/BackgroundLayer";
import { AnalyticsConsentPopover } from "./components/ui/molecules/AnalyticsConsentPopover";
import { ErrorBoundary } from "./components/ui/molecules/ErrorBoundary";
import { publicEnv } from "./config/publicEnv";
import { useAnalyticsConsent } from "./privacy/useAnalyticsConsent";

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

			<main className="relative z-10">
				<Hero onLaunchConfetti={launchConfetti} />
				<About />
				<Members />
				<ErrorBoundary>
					<Agenda />
				</ErrorBoundary>
				<ErrorBoundary>
					<Contact />
				</ErrorBoundary>
			</main>

			<Footer onOpenPrivacy={open} />

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
