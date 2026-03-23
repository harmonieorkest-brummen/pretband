import { publicEnv } from "./publicEnv";

export const FEATURE_FLAGS = {
	GALLERY: publicEnv.showGallery,
	ABOUT: publicEnv.showAbout,
	AGENDA: publicEnv.showAgenda,
	MEMBERS: publicEnv.showMembers,
	HIGHLIGHTS: publicEnv.showHighlights,
	CONTACT: publicEnv.showContact,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(key: FeatureFlagKey): boolean {
	return FEATURE_FLAGS[key];
}
