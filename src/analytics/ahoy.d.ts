export {};

declare global {
	interface AhoyConfig {
		visitsUrl?: string;
		eventsUrl?: string;
		page?: string | null;
		startOnReady?: boolean;
	}

	interface AhoyApi {
		configure: (options: AhoyConfig) => void;
		start?: () => void;
		trackView: () => void;
		trackSubmits: (selector: string) => void;
		track?: (name: string, properties?: Record<string, unknown>) => void;
	}

	interface Window {
		// Before `ahoy.js` loads, we may set config-only defaults here.
		// After load, `ahoy.js` mutates this into a full API object.
		ahoy?: AhoyApi | AhoyConfig | (AhoyApi & AhoyConfig);
		__pretAhoyState?: { status: "idle" | "loading" | "ready"; formId?: string };
	}
}
