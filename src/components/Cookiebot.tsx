import { useEffect } from "react";

/**
 * Cookiebot component handles the injection of the Cookiebot consent script.
 * 
 * @param cbid - Your Cookiebot Domain Group ID
 */
export function Cookiebot({ cbid }: { cbid: string }) {
	useEffect(() => {
		// Avoid duplicate injection
		if (!cbid || document.getElementById("Cookiebot")) return;

		const script = document.createElement("script");
		script.id = "Cookiebot";
		script.src = "https://consent.cookiebot.com/uc.js";
		script.dataset.cbid = cbid;
		script.dataset.blockingmode = "auto";
		script.type = "text/javascript";
		script.async = true;

		document.head.appendChild(script);
	}, [cbid]);

	return null;
}
