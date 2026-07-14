import { render } from "@testing-library/react";
import { Suspense } from "react";
import { describe, expect, it, vi } from "vitest";
import { AnalyticsProvider } from "@/analytics/AnalyticsContext";
import { GtmProvider } from "@/analytics/GtmContext";
import { SecurityProvider } from "@/security/SecurityContext";

vi.mock("@/analytics/useBasinAhoy", () => ({
	useBasinAhoy: vi.fn(),
}));

vi.mock("react-i18next", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-i18next")>();
	return {
		...actual,
		useTranslation: () => ({
			t: (key: string) => key,
			i18n: { language: "nl", changeLanguage: vi.fn() },
		}),
		Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
	};
});

vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

// The confetti burst fires a fire-and-forget dashboard counter; stub it so no
// real network request escapes the test.
vi.mock("@/utils/adminData", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/utils/adminData")>()),
	trackEvent: vi.fn(),
}));

window.IntersectionObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof IntersectionObserver;

const { default: App } = await import("@/App");

describe("App", () => {
	it("renders the main content element", () => {
		render(
			<SecurityProvider>
				<AnalyticsProvider>
					<GtmProvider>
						<Suspense fallback={null}>
							<App />
						</Suspense>
					</GtmProvider>
				</AnalyticsProvider>
			</SecurityProvider>,
		);
		expect(document.getElementById("main-content")).toBeInTheDocument();
	});
});
