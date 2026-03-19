import { useCallback, useEffect, useState } from "react";

export type AnalyticsConsent = "unknown" | "granted" | "denied";

const STORAGE_KEY = "pret_analytics_consent_v1";

function readConsent(): AnalyticsConsent {
	try {
		const v = localStorage.getItem(STORAGE_KEY);
		if (v === "granted" || v === "denied") return v;
	} catch {
		// ignore
	}
	return "unknown";
}

function writeConsent(consent: Exclude<AnalyticsConsent, "unknown">) {
	try {
		localStorage.setItem(STORAGE_KEY, consent);
	} catch {
		// ignore
	}
}

function clearConsent() {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
}

export function useAnalyticsConsent() {
	const [consent, setConsent] = useState<AnalyticsConsent>("unknown");
	const [isOpen, setIsOpen] = useState(false);

	const syncFromStorage = useCallback(() => {
		const c = readConsent();
		setConsent(c);
		return c;
	}, []);

	useEffect(() => {
		const c = syncFromStorage();
		if (c === "unknown") setIsOpen(true);
	}, [syncFromStorage]);

	const open = useCallback(() => {
		syncFromStorage();
		setIsOpen(true);
	}, [syncFromStorage]);
	const close = useCallback(() => setIsOpen(false), []);

	const grant = useCallback(() => {
		writeConsent("granted");
		syncFromStorage();
		setIsOpen(false);
	}, [syncFromStorage]);

	const deny = useCallback(() => {
		writeConsent("denied");
		syncFromStorage();
		setIsOpen(false);
	}, [syncFromStorage]);

	const reset = useCallback(() => {
		clearConsent();
		syncFromStorage();
		setIsOpen(true);
	}, [syncFromStorage]);

	return { consent, isOpen, open, close, grant, deny, reset };
}
