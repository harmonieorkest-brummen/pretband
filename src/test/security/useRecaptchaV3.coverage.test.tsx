import { act, renderHook, waitFor } from "@testing-library/react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SecurityProvider } from "@/security/SecurityContext";
import { useRecaptchaV3 } from "@/security/useRecaptchaV3";

function wrapper({ children }: { children: React.ReactNode }) {
	return <SecurityProvider>{children}</SecurityProvider>;
}

const SELECTOR = 'script[data-pret-recaptcha="v3"]';

function grantConsent() {
	window.Cookiebot = {
		renew: vi.fn(),
		consent: { statistics: true, marketing: true, preferences: false },
	};
}

function makeGrecaptcha(token = "token-abc") {
	const execute = vi.fn(async () => token);
	window.grecaptcha = {
		ready: (cb: () => void) => cb(),
		execute,
	};
	return execute;
}

function injectExistingScript() {
	const script = document.createElement("script");
	script.dataset.pretRecaptcha = "v3";
	document.head.appendChild(script);
	return script;
}

beforeEach(() => {
	// Clean slate: no scripts, no grecaptcha, no consent.
	for (const s of Array.from(document.querySelectorAll(SELECTOR))) s.remove();
	window.grecaptcha = undefined;
	window.Cookiebot = undefined;
});

afterEach(() => {
	for (const s of Array.from(document.querySelectorAll(SELECTOR))) s.remove();
	window.grecaptcha = undefined;
	window.Cookiebot = undefined;
	vi.restoreAllMocks();
});

describe("useRecaptchaV3 — missing / disabled key", () => {
	it("execute throws when the site key is empty (missing-key branch)", async () => {
		const { result } = renderHook(() => useRecaptchaV3("", true), { wrapper });
		await expect(result.current.execute("submit")).rejects.toThrow(
			"Missing reCAPTCHA site key",
		);
		// The effect must bail out too: nothing injected.
		expect(document.querySelector(SELECTOR)).toBeNull();
	});

	it("does not inject a script when disabled even with consent granted", () => {
		grantConsent();
		renderHook(() => useRecaptchaV3("key-disabled", false), { wrapper });
		expect(document.querySelector(SELECTOR)).toBeNull();
	});

	it("trims whitespace-only keys down to the missing-key branch", async () => {
		const { result } = renderHook(() => useRecaptchaV3("   ", true), {
			wrapper,
		});
		await expect(result.current.execute("submit")).rejects.toThrow(
			"Missing reCAPTCHA site key",
		);
	});
});

describe("useRecaptchaV3 — consent-gated script injection", () => {
	it("injects the v3 script when marketing consent is present", async () => {
		grantConsent();
		makeGrecaptcha();
		renderHook(() => useRecaptchaV3("site-key-1", true), { wrapper });

		let script: HTMLScriptElement | null = null;
		await waitFor(() => {
			script = document.querySelector<HTMLScriptElement>(SELECTOR);
			expect(script).not.toBeNull();
		});

		const injected = script as unknown as HTMLScriptElement;
		expect(injected.src).toContain("recaptcha/api.js");
		expect(injected.src).toContain("render=site-key-1");
		expect(injected.async).toBe(true);
		expect(injected.defer).toBe(true);
		expect(injected.dataset.pretRecaptcha).toBe("v3");

		// Fire load so the pending promise settles and state transitions to ready.
		await act(async () => {
			injected.dispatchEvent(new Event("load"));
		});
	});

	it("grants via the preferences consent flag as well", async () => {
		window.Cookiebot = {
			renew: vi.fn(),
			consent: { statistics: false, marketing: false, preferences: true },
		};
		makeGrecaptcha();
		renderHook(() => useRecaptchaV3("site-key-pref", true), { wrapper });

		await waitFor(() =>
			expect(document.querySelector(SELECTOR)).not.toBeNull(),
		);
		await act(async () => {
			document.querySelector(SELECTOR)?.dispatchEvent(new Event("load"));
		});
	});

	it("waits for CookiebotOnAccept when consent is not yet granted", async () => {
		window.Cookiebot = {
			renew: vi.fn(),
			consent: { statistics: false, marketing: false, preferences: false },
		};
		makeGrecaptcha();
		renderHook(() => useRecaptchaV3("site-key-late", true), { wrapper });

		// No consent -> nothing injected yet.
		expect(document.querySelector(SELECTOR)).toBeNull();

		// User accepts later: consent flips and the event fires.
		if (window.Cookiebot?.consent) window.Cookiebot.consent.marketing = true;
		await act(async () => {
			window.dispatchEvent(new Event("CookiebotOnAccept"));
		});

		await waitFor(() =>
			expect(document.querySelector(SELECTOR)).not.toBeNull(),
		);
		await act(async () => {
			document.querySelector(SELECTOR)?.dispatchEvent(new Event("load"));
		});
	});

	it("removes the CookiebotOnAccept listener on unmount", () => {
		window.Cookiebot = {
			renew: vi.fn(),
			consent: { statistics: false, marketing: false, preferences: false },
		};
		const removeSpy = vi.spyOn(window, "removeEventListener");
		const { unmount } = renderHook(() => useRecaptchaV3("site-key-x", true), {
			wrapper,
		});
		unmount();
		expect(removeSpy).toHaveBeenCalledWith(
			"CookiebotOnAccept",
			expect.any(Function),
		);
	});
});

describe("useRecaptchaV3 — execute()", () => {
	it("resolves with a token from grecaptcha.execute (ready path)", async () => {
		injectExistingScript(); // existing script + grecaptcha => resolves immediately
		const execute = makeGrecaptcha("token-xyz");
		const { result } = renderHook(() => useRecaptchaV3("exec-key", false), {
			wrapper,
		});

		let token: string | undefined;
		await act(async () => {
			token = await result.current.execute("contact_submit");
		});

		expect(token).toBe("token-xyz");
		expect(execute).toHaveBeenCalledWith("exec-key", {
			action: "contact_submit",
		});
	});

	it("short-circuits load once the state is ready on a second call", async () => {
		injectExistingScript();
		makeGrecaptcha("tok-1");
		const { result } = renderHook(() => useRecaptchaV3("ready-key", false), {
			wrapper,
		});

		await act(async () => {
			await result.current.execute("first");
		});
		// State is now "ready"; a second call takes the early-return branch.
		let token: string | undefined;
		await act(async () => {
			token = await result.current.execute("second");
		});
		expect(token).toBe("tok-1");
		// Only the pre-injected script exists — no extra injection.
		expect(document.querySelectorAll(SELECTOR)).toHaveLength(1);
	});

	it("throws when grecaptcha is unavailable after the script loads", async () => {
		// No grecaptcha; fresh script gets injected and we fire its load event.
		const { result } = renderHook(
			() => useRecaptchaV3("no-grecaptcha", false),
			{ wrapper },
		);

		const promise = result.current.execute("submit");
		// Attach the rejection handler before firing so the failure never
		// surfaces as an unhandled rejection.
		const assertion = expect(promise).rejects.toThrow(
			"reCAPTCHA is not available",
		);
		await waitFor(() =>
			expect(document.querySelector(SELECTOR)).not.toBeNull(),
		);
		await act(async () => {
			document.querySelector(SELECTOR)?.dispatchEvent(new Event("load"));
		});
		await assertion;
	});

	it("rejects when a freshly injected script fails to load", async () => {
		const { result } = renderHook(() => useRecaptchaV3("fail-key", false), {
			wrapper,
		});

		const promise = result.current.execute("submit");
		const assertion = expect(promise).rejects.toThrow(
			"Failed to load reCAPTCHA",
		);
		await waitFor(() =>
			expect(document.querySelector(SELECTOR)).not.toBeNull(),
		);
		await act(async () => {
			document.querySelector(SELECTOR)?.dispatchEvent(new Event("error"));
		});
		await assertion;
	});

	it("resolves via an existing script's load event when grecaptcha appears late", async () => {
		const existing = injectExistingScript(); // exists but no grecaptcha yet
		const { result } = renderHook(() => useRecaptchaV3("late-key", false), {
			wrapper,
		});

		const promise = result.current.execute("submit");
		// grecaptcha becomes available, then the existing script signals load.
		const execute = makeGrecaptcha("late-token");
		await act(async () => {
			existing.dispatchEvent(new Event("load"));
		});
		await expect(promise).resolves.toBe("late-token");
		expect(execute).toHaveBeenCalledWith("late-key", { action: "submit" });
	});

	it("propagates a rejection from grecaptcha.execute", async () => {
		injectExistingScript();
		window.grecaptcha = {
			ready: (cb: () => void) => cb(),
			execute: vi.fn(async () => {
				throw new Error("boom");
			}),
		};
		const { result } = renderHook(() => useRecaptchaV3("err-key", false), {
			wrapper,
		});

		await expect(result.current.execute("submit")).rejects.toThrow("boom");
	});
});
