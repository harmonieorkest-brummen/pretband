import { useCallback, useEffect, useMemo } from "react";
import { useSecurityContext } from "./SecurityContext";

function recaptchaSrc(siteKey: string) {
	return `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
}

/**
 * Loads reCAPTCHA v3 and exposes an execute function to get a token per action.
 * Note: the site key is public; keep the secret key server-side (Basin handles verification).
 */
export function useRecaptchaV3(siteKey: string, enabled = true) {
	const { state, setState } = useSecurityContext();
	const stableKey = useMemo(() => siteKey.trim(), [siteKey]);

	const loadRecaptchaV3 = useCallback(
		async (key: string): Promise<void> => {
			if (state.status === "ready" && state.siteKey === key) return;
			if (state.status === "loading" && state.siteKey === key) {
				return state.promise || Promise.resolve();
			}

			const existingScript = document.querySelector(
				'script[data-pret-recaptcha="v3"]',
			) as HTMLScriptElement | null;

			let promise: Promise<void>;
			if (existingScript) {
				promise = new Promise<void>((resolve, reject) => {
					if (window.grecaptcha) resolve();
					else {
						existingScript.addEventListener("load", () => resolve(), {
							once: true,
						});
						existingScript.addEventListener(
							"error",
							() => reject(new Error("Failed to load reCAPTCHA")),
							{ once: true },
						);
					}
				});
			} else {
				const script = document.createElement("script");
				script.src = recaptchaSrc(key);
				script.async = true;
				script.defer = true;
				script.dataset.pretRecaptcha = "v3";

				promise = new Promise<void>((resolve, reject) => {
					script.addEventListener("load", () => resolve(), { once: true });
					script.addEventListener(
						"error",
						() => reject(new Error("Failed to load reCAPTCHA")),
						{ once: true },
					);
				});
				document.head.appendChild(script);
			}

			setState({ status: "loading", siteKey: key, promise });
			await promise;
			setState({ status: "ready", siteKey: key, promise: null });
		},
		[state, setState],
	);

	useEffect(() => {
		if (!stableKey || !enabled) return;
		void loadRecaptchaV3(stableKey);
	}, [stableKey, enabled, loadRecaptchaV3]);

	const execute = useCallback(
		async (action: string) => {
			if (!stableKey) throw new Error("Missing reCAPTCHA site key");
			await loadRecaptchaV3(stableKey);

			if (!window.grecaptcha) {
				throw new Error("reCAPTCHA is not available");
			}

			return await new Promise<string>((resolve, reject) => {
				window.grecaptcha?.ready(() => {
					window.grecaptcha
						?.execute(stableKey, { action })
						.then((token) => resolve(token))
						.catch((err) => reject(err));
				});
			});
		},
		[stableKey, loadRecaptchaV3],
	);

	return { execute };
}
