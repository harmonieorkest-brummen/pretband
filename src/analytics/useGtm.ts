import { useCallback, useEffect } from "react";
import { useGtmContext } from "./GtmContext";

declare global {
	interface Window {
		dataLayer: unknown[];
		gtag: (...args: unknown[]) => void;
		Cookiebot?: {
			renew: () => void;
			show: () => void;
			hide: () => void;
		};
	}
}

function initGtag(tagId: string) {
	window.dataLayer = window.dataLayer || [];
	window.gtag = function gtag(...args: unknown[]) {
		window.dataLayer.push(args);
	};
	window.gtag("js", new Date());
	window.gtag("config", tagId);
}

function initGtm() {
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
}

export function useGtm(tagId: string, enabled: boolean) {
	const { state, setState } = useGtmContext();

	const load = useCallback(() => {
		if (state.status !== "idle" || !tagId) return;

		setState({ status: "loading", tagId });

		const isGtm = tagId.startsWith("GTM-");
		const isGa4 = tagId.startsWith("G-");

		if (isGtm) {
			initGtm();
		} else if (isGa4) {
			initGtag(tagId);
		}

		// Load script
		const script = document.createElement("script");
		script.src = isGtm
			? `https://www.googletagmanager.com/gtm.js?id=${tagId}`
			: `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
		script.async = true;
		script.onload = () => {
			setState({ status: "ready", tagId });
		};
		script.onerror = () => {
			setState({ status: "idle", tagId: null });
		};

		document.head.appendChild(script);
	}, [tagId, state.status, setState]);

	useEffect(() => {
		if (enabled && tagId) {
			load();
		}
	}, [enabled, tagId, load]);
}
