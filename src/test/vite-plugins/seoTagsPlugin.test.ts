import type { Plugin } from "vite";
import { describe, expect, it } from "vitest";
import { seoTagsPlugin } from "@/vite-plugins/seoTagsPlugin";

type TagDescriptor = {
	tag: string;
	attrs?: Record<string, string>;
	children?: string;
};

function callTransformIndexHtml(plugin: Plugin, html: string) {
	const hook = plugin.transformIndexHtml;
	const fn =
		typeof hook === "function"
			? hook
			: (
					hook as unknown as {
						handler: (html: string) => { html: string; tags: TagDescriptor[] };
					}
				).handler;
	return (fn as (html: string) => { html: string; tags: TagDescriptor[] })(
		html,
	);
}

describe("seoTagsPlugin", () => {
	it("returns null when command is 'serve'", () => {
		const plugin = seoTagsPlugin("serve", "https://pretband.nl");
		expect(plugin).toBeNull();
	});

	it("returns a plugin with name 'pret-seo-tags' when command is 'build'", () => {
		const plugin = seoTagsPlugin("build", "https://pretband.nl");
		expect(plugin).not.toBeNull();
		expect(plugin?.name).toBe("pret-seo-tags");
	});

	it("transformIndexHtml returns SEO meta tags and updates the title", () => {
		const plugin = seoTagsPlugin("build", "https://pretband.nl") as Plugin;
		const result = callTransformIndexHtml(
			plugin,
			"<html><head><title>Old Title</title></head><body></body></html>",
		);

		expect(result.html).toContain("Pretband Help Ons Bloaz'n");

		const { tags } = result;
		expect(Array.isArray(tags)).toBe(true);

		expect(
			tags.find((t) => t.tag === "meta" && t.attrs?.name === "description"),
		).toBeDefined();
		expect(
			tags.find((t) => t.tag === "meta" && t.attrs?.property === "og:title"),
		).toBeDefined();

		const canonical = tags.find(
			(t) => t.tag === "link" && t.attrs?.rel === "canonical",
		);
		expect(canonical).toBeDefined();
		expect(canonical?.attrs?.href).toBe("https://pretband.nl/");

		const llmsLink = tags.find(
			(t) =>
				t.tag === "link" &&
				t.attrs?.rel === "alternate" &&
				t.attrs?.type === "text/plain",
		);
		expect(llmsLink?.attrs?.href).toBe("/llms.txt");

		const jsonLdTag = tags.find(
			(t) => t.tag === "script" && t.attrs?.type === "application/ld+json",
		);
		expect(jsonLdTag).toBeDefined();
		const jsonLd = JSON.parse(jsonLdTag?.children ?? "{}");
		expect(jsonLd["@type"]).toBe("Organization");
		expect(jsonLd.name).toBe("Pretband Help Ons Bloaz'n");
		expect(jsonLd.url).toBe("https://pretband.nl/");
		expect(jsonLd.logo).toBe("https://pretband.nl/logo.png");
		expect(jsonLd.description).toContain("pretband");
	});

	it("does not produce a canonical link when no siteUrl is provided", () => {
		const plugin = seoTagsPlugin("build", "") as Plugin;
		const result = callTransformIndexHtml(
			plugin,
			"<html><head><title>Old</title></head><body></body></html>",
		);
		const canonical = result.tags.find(
			(t) => t.tag === "link" && t.attrs?.rel === "canonical",
		);
		expect(canonical).toBeUndefined();
	});
});
