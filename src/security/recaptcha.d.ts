export {};

declare global {
	interface Window {
		grecaptcha?: {
			ready: (cb: () => void) => void;
			execute: (siteKey: string, opts: { action: string }) => Promise<string>;
		};
		__pretRecaptchaState?:
			| { status: "idle" }
			| { status: "loading"; siteKey: string; promise: Promise<void> }
			| { status: "ready"; siteKey: string };
	}
}
