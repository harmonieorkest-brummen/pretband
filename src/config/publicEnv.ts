function envString(v: unknown): string | undefined {
	return typeof v === "string" && v.trim().length > 0 ? v : undefined;
}

export const publicEnv = {
	basinFormId: envString(import.meta.env.VITE_BASIN_FORM_ID),
	recaptchaSiteKey: envString(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
	instagramUrl: envString(import.meta.env.VITE_INSTAGRAM_URL),
	tiktokUrl: envString(import.meta.env.VITE_TIKTOK_URL),
	gtmTagId: envString(import.meta.env.VITE_GTM_TAG_ID),
};
