import type { HtmlTagDescriptor, Plugin } from "vite";

export function seoTagsPlugin(
	command: "build" | "serve",
	siteUrl: string,
): Plugin | null {
	if (command !== "build") return null;

	const url = siteUrl.replace(/\/+$/, "");
	const canonical = url ? `${url}/` : "";
	const ogImage = url ? `${url}/logo.png` : "./logo.png";

	const title = "Pretband Help Ons Bloaz'n | Brummen";
	const description =
		"De Pretband van Brummen: dé pretband (dweilorkest) voor chaos, feest en pure pret. Boek ons voor festivals, evenementen en straatfeesten.";

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "MusicGroup",
		name: "Pretband Help Ons Bloaz'n",
		url: canonical || undefined,
		genre: ["Brass band", "Dweilorkest", "Feestband"],
		areaServed: "NL",
	};

	return {
		name: "pret-seo-tags",
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
	};
}
