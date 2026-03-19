import { useCallback, useEffect } from "react";
import { useAnalyticsContext } from "./AnalyticsContext";

function configureAhoy(formId: string) {
	if (!window.ahoy) return;
	if (!("configure" in window.ahoy)) return;

	window.ahoy.configure({
		visitsUrl: "https://usebasin.com/ahoy/visits",
		eventsUrl: "https://usebasin.com/ahoy/events",
		page: formId,
		startOnReady: false,
	});

	// After configure, the API should be present.
	if ("trackView" in window.ahoy) {
		window.ahoy.start?.();
		window.ahoy.trackView();
	}
}

/**
 * React-friendly Basin Ahoy integration.
 * - Loads ahoy.js from the bundled npm dependency (no CDN).
 * - Configures endpoints for Basin.
 * - Tracks initial view (avoid auto-tracking submits to reduce PII risk).
 */
export function useBasinAhoy(formId: string, enabled: boolean) {
	const { state, setState } = useAnalyticsContext();

	const run = useCallback(async () => {
		// Already configured for this (or any) form id.
		if (state.status === "ready") {
			if (state.formId !== formId) {
				configureAhoy(formId);
				setState((s) => ({ ...s, formId }));
			}
			return;
		}

		if (state.status === "loading") return;

		setState({ status: "loading", formId });

		// Configure before the library auto-starts, then start explicitly after configure.
		// The library reads `window.ahoy` defaults at import time.
		window.ahoy = window.ahoy ?? { startOnReady: false };

		// Import attaches `window.ahoy`.
		await import("ahoy.js");

		configureAhoy(formId);
		setState({ status: "ready", formId });
	}, [formId, state, setState]);

	useEffect(() => {
		if (!enabled) return;
		void run();
	}, [enabled, run]);
}
