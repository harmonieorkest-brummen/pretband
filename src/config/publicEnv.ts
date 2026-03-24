function envString(v: unknown): string | undefined {
	return typeof v === "string" && v.trim().length > 0 ? v : undefined;
}

function envBoolean(v: unknown, defaultValue = true): boolean {
	if (typeof v === "string") {
		if (v === "true" || v === "1") return true;
		if (v === "false" || v === "0") return false;
	}
	return defaultValue;
}

export const publicEnv = {
	basinFormId: envString(import.meta.env.VITE_BASIN_FORM_ID),
	recaptchaSiteKey: envString(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
	instagramUrl: envString(import.meta.env.VITE_INSTAGRAM_URL),
	tiktokUrl: envString(import.meta.env.VITE_TIKTOK_URL),
	gtmTagId: envString(import.meta.env.VITE_GTM_TAG_ID),
	cookiebotId: envString(import.meta.env.VITE_COOKIEBOT_ID),
	showGallery: envBoolean(import.meta.env.VITE_SHOW_GALLERY, true),
	showAbout: envBoolean(import.meta.env.VITE_SHOW_ABOUT, true),
	showAgenda: envBoolean(import.meta.env.VITE_SHOW_AGENDA, true),
	showMembers: envBoolean(import.meta.env.VITE_SHOW_MEMBERS, true),
	showHighlights: envBoolean(import.meta.env.VITE_SHOW_HIGHLIGHTS, true),
	showContact: envBoolean(import.meta.env.VITE_SHOW_CONTACT, true),
};
