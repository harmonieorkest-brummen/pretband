import type { HtmlTagDescriptor, Plugin } from "vite";

export function securityMetaPlugin(command: "build" | "serve"): Plugin | null {
	if (command !== "build") return null;

	// Note: on GitHub Pages we can't reliably set HTTP response headers.
	// We inject a meta-based CSP for production builds. Some directives
	// (notably `frame-ancestors`) are header-only in practice, so we also
	// add a runtime frame-busting check in App.tsx as defense-in-depth.
	const csp = [
		"default-src 'self'",
		"base-uri 'none'",
		"object-src 'none'",
		"script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://consent.cookiebot.com https://consentcdn.cookiebot.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"img-src 'self' data: https://www.gstatic.com https://www.google-analytics.com https://www.google.com https://www.googletagmanager.com https://images.unsplash.com https://consentcdn.cookiebot.com",
		"font-src 'self' https://fonts.gstatic.com data:",
		"connect-src 'self' https://pretband-backend.vercel.app https://usebasin.com https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://region1.analytics.google.com https://www.googletagmanager.com https://tagassistant.google.com wss://tagassistant.google.com https://www.google.com https://www.gstatic.com https://consent.cookiebot.com https://consentcdn.cookiebot.com",
		"frame-src https://www.google.com https://www.google.com/recaptcha/ https://www.googletagmanager.com https://tagassistant.google.com https://consent.cookiebot.com https://consentcdn.cookiebot.com",
		"worker-src 'self' blob:",
		"form-action 'self' https://usebasin.com",
		"upgrade-insecure-requests",
		// Best effort in meta CSP; enforce with headers if you ever add a reverse proxy.
	].join("; ");

	return {
		name: "pret-security-meta",
		transformIndexHtml() {
			return [
				{
					tag: "meta",
					injectTo: "head",
					attrs: { "http-equiv": "Content-Security-Policy", content: csp },
				},
				{
					tag: "meta",
					injectTo: "head",
					attrs: {
						name: "referrer",
						content: "strict-origin-when-cross-origin",
					},
				},
			] as HtmlTagDescriptor[];
		},
	};
}
