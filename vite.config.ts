import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import Sitemap from "vite-plugin-sitemap";
import { securityMetaPlugin } from "./vite-plugins/securityMetaPlugin";
import { seoTagsPlugin } from "./vite-plugins/seoTagsPlugin";

export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	let siteUrl = env.SITE_URL || env.VITE_SITE_URL || "https://pretband.nl";
	if (!siteUrl.startsWith("http")) {
		siteUrl = `https://${siteUrl}`;
	}

	return {
		plugins: [
			react(),
			securityMetaPlugin(command),
			seoTagsPlugin(command, siteUrl),
			Sitemap({
				hostname: siteUrl,
				generateRobotsTxt: true,
				robots: [{ userAgent: "*", allow: "/" }],
			}),
			tailwindcss(),
		].filter(Boolean) as Plugin[],
		resolve: {
			tsconfigPaths: true,
		},
		base: "./",
		build: {
			modulePreload: false,
			outDir: "dist",
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes("node_modules")) {
							if (id.includes("react") || id.includes("i18next")) {
								return "vendor";
							}
						}
					},
				},
			},
		},
		test: {
			globals: true,
			environment: "jsdom",
			setupFiles: "./src/test/setup.ts",
			css: true,
			typecheck: {
				tsconfig: "./tsconfig.test.json",
			},
		},
	};
});
