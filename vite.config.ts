import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {
	defineConfig,
	type HtmlTagDescriptor,
	loadEnv,
	type Plugin,
} from "vite";

function securityMetaPlugin(command: "build" | "serve"): Plugin | null {
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
		"connect-src 'self' https://usebasin.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://consent.cookiebot.com https://consentcdn.cookiebot.com",
		"frame-src https://www.google.com https://www.google.com/recaptcha/ https://www.googletagmanager.com https://consent.cookiebot.com https://consentcdn.cookiebot.com",
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

function seoPlugin(command: "build" | "serve", siteUrl: string): Plugin | null {
	if (command !== "build") return null;

	const url = siteUrl.replace(/\/+$/, "");
	const canonical = url ? `${url}/` : "";
	const ogImage = url ? `${url}/logo.png` : "./logo.png";

	const title = "Pretband Help Ons Bloaz'n | Brummen";
	const description =
		"De Pretband van Brummen: dweilorkest vol chaos, feest en pure pret. Boek ons voor festivals, evenementen en straatfeesten.";

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "MusicGroup",
		name: "Pretband Help Ons Bloaz'n",
		url: canonical || undefined,
		genre: ["Brass band", "Dweilorkest", "Feestband"],
		areaServed: "NL",
		// Social links are optional and can be set via VITE_ env vars at build time if desired.
	};

	return {
		name: "pret-seo",
		transformIndexHtml(html) {
			const tags: HtmlTagDescriptor[] = [
				{
					tag: "meta",
					injectTo: "head",
					attrs: { name: "description", content: description },
				},
				{
					tag: "meta",
					injectTo: "head",
					attrs: { name: "robots", content: "index,follow" },
				},
				{
					tag: "meta",
					injectTo: "head",
					attrs: { name: "theme-color", content: "#2A2324" },
				},
				{
					tag: "meta",
					injectTo: "head",
					attrs: {
						property: "og:site_name",
						content: "Pretband Help Ons Bloaz'n",
					},
				},
				{
					tag: "meta",
					injectTo: "head",
					attrs: { property: "og:type", content: "website" },
				},
				{
					tag: "meta",
					injectTo: "head",
					attrs: { property: "og:title", content: title },
				},
				{
					tag: "meta",
					injectTo: "head",
					attrs: { property: "og:description", content: description },
				},
				{
					tag: "meta",
					injectTo: "head",
					attrs: { property: "og:locale", content: "nl_NL" },
				},
				{
					tag: "meta",
					injectTo: "head",
					attrs: { property: "og:image", content: ogImage },
				},
				{
					tag: "meta",
					injectTo: "head",
					attrs: { name: "twitter:card", content: "summary" },
				},
				{
					tag: "meta",
					injectTo: "head",
					attrs: { name: "twitter:title", content: title },
				},
				{
					tag: "meta",
					injectTo: "head",
					attrs: { name: "twitter:description", content: description },
				},
				{
					tag: "link",
					injectTo: "head",
					attrs: { rel: "icon", href: "./logo.png" },
				},
			];

			if (canonical) {
				tags.push({
					tag: "link",
					injectTo: "head",
					attrs: { rel: "canonical", href: canonical },
				});
				tags.push({
					tag: "meta",
					injectTo: "head",
					attrs: { property: "og:url", content: canonical },
				});
			}

			tags.push({
				tag: "script",
				injectTo: "head",
				attrs: { type: "application/ld+json" },
				children: JSON.stringify(jsonLd),
			});

			const nextHtml = html.replace(
				/<title>.*?<\/title>/,
				`<title>${title}</title>`,
			);
			return { html: nextHtml, tags };
		},
		generateBundle() {
			// Basic SEO files. Requires SITE_URL to be useful for crawlers.
			if (!url) return;

			const urls = [canonical];
			const sitemap =
				`<?xml version="1.0" encoding="UTF-8"?>\n` +
				`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
				urls
					.filter(Boolean)
					.map((u) => `  <url><loc>${u}</loc></url>\n`)
					.join("") +
				`</urlset>\n`;

			const robots = `User-agent: *\nAllow: /\nSitemap: ${url}/sitemap.xml\n`;

			this.emitFile({
				type: "asset",
				fileName: "sitemap.xml",
				source: sitemap,
			});
			this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });
		},
	};
}

export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const siteUrl = env.SITE_URL || env.VITE_SITE_URL || "";

	return {
		plugins: [
			react(),
			securityMetaPlugin(command),
			seoPlugin(command, siteUrl),
			tailwindcss(),
		].filter(Boolean) as Plugin[],
		esbuild: {
			drop: command === "build" ? ["console", "debugger"] : [],
		},
		base: "./",
		build: {
			outDir: "dist",
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ["react", "react-dom", "react-i18next", "i18next"],
					},
				},
			},
		},
	};
});
