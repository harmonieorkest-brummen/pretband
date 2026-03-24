import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { securityMetaPlugin, seoPlugin } from "./vite.plugins";

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
		resolve: {
			tsconfigPaths: true,
		},
		base: "./",
		build: {
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
		},
	};
});
