import { useCallback, useEffect } from "react";
import { useGtmContext } from "./GtmContext";

declare global {
	interface Window {
		dataLayer: unknown[];
		gtag: (...args: unknown[]) => void;
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

export function useGtm(tagId: string, enabled: boolean) {
	const { state, setState } = useGtmContext();

	const load = useCallback(() => {
		if (state.status !== "idle") return;

		setState({ status: "loading", tagId });

		// Initialize dataLayer and gtag function
		initGtag(tagId);

		// Load script
		const script = document.createElement("script");
		script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
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
