type RedirectEntry = {
	/** URL-safe identifier encoded in the QR code, e.g. "flyer". */
	slug: string;
	/** Absolute http(s) destination the QR redirects to. */
	url: string;
	/** Optional human label shown in the admin panel. */
	label?: string;
	/** Read-only scan count returned by the API; ignored when saving. */
	scans?: number;
};

type RedirectsData = {
	redirects: RedirectEntry[];
};
