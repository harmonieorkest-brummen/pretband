export function sectionHref(sectionId: string): string {
	return `#/#${encodeURIComponent(sectionId)}`;
}

export function getSectionIdFromHash(
	hash = window.location.hash,
): string | null {
	const match = hash.match(/^#\/#([^/?&]+)/);
	return match ? decodeURIComponent(match[1]) : null;
}

export function scrollToSection(
	sectionId: string,
	{
		behavior = "smooth",
		attempts = 12,
		intervalMs = 50,
	}: {
		behavior?: ScrollBehavior;
		attempts?: number;
		intervalMs?: number;
	} = {},
): boolean {
	const element = document.getElementById(sectionId);

	if (element) {
		element.scrollIntoView({ behavior, block: "start" });
		return true;
	}

	if (attempts > 0) {
		window.setTimeout(() => {
			scrollToSection(sectionId, {
				behavior,
				attempts: attempts - 1,
				intervalMs,
			});
		}, intervalMs);
	}

	return false;
}

export function navigateToSection(sectionId: string): void {
	const targetHash = sectionHref(sectionId);

	if (window.location.hash !== targetHash) {
		window.history.pushState(
			null,
			"",
			`${window.location.pathname}${window.location.search}${targetHash}`,
		);
	}

	scrollToSection(sectionId);
}
