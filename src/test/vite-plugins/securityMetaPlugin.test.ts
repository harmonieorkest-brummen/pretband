import type { Plugin } from "vite";
import { describe, expect, it } from "vitest";
import { securityMetaPlugin } from "@/vite-plugins/securityMetaPlugin";

type TagDescriptor = { tag: string; attrs: Record<string, string> };

function callTransformIndexHtml(plugin: Plugin) {
	const hook = plugin.transformIndexHtml;
	const fn = typeof hook === "function" ? hook : (hook as any).handler;
	return (fn as (html: string) => TagDescriptor[])(
		"<html><head></head><body></body></html>",
	);
}

describe("securityMetaPlugin", () => {
	it("returns null when command is 'serve'", () => {
		const plugin = securityMetaPlugin("serve");
		expect(plugin).toBeNull();
	});

	it("returns a plugin with name 'pret-security-meta' when command is 'build'", () => {
		const plugin = securityMetaPlugin("build");
		expect(plugin).not.toBeNull();
		expect(plugin?.name).toBe("pret-security-meta");
	});

	it("transformIndexHtml returns CSP and referrer meta tags", () => {
		const plugin = securityMetaPlugin("build") as Plugin;
		const tags = callTransformIndexHtml(plugin);

		expect(Array.isArray(tags)).toBe(true);
		const cspTag = tags.find(
			(t) =>
				t.tag === "meta" &&
				t.attrs?.["http-equiv"] === "Content-Security-Policy",
		);
		expect(cspTag).toBeDefined();
		expect(cspTag?.attrs.content).toContain("default-src");
		expect(cspTag?.attrs.content).toContain(
			"https://region1.analytics.google.com",
		);

		const referrerTag = tags.find(
			(t) => t.tag === "meta" && t.attrs?.name === "referrer",
		);
		expect(referrerTag).toBeDefined();
		expect(referrerTag?.attrs.content).toBe("strict-origin-when-cross-origin");
	});
});
