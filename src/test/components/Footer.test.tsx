import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Footer } from "@/components/layout/Footer";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
	Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

vi.mock("@/config/publicEnv", () => ({
	publicEnv: {
		instagramUrl: "https://instagram.com",
		tiktokUrl: "https://tiktok.com",
	},
}));

describe("Footer Component", () => {
	it("renders footer text and social links", () => {
		const handleOpenPrivacy = vi.fn();
		render(<Footer onOpenPrivacy={handleOpenPrivacy} />);

		expect(screen.getByText("footer.tagline")).toBeInTheDocument();
		expect(screen.getByText("footer.follow")).toBeInTheDocument();

		expect(screen.getByLabelText("footer.instagram")).toBeInTheDocument();
		expect(screen.getByLabelText("footer.tiktok")).toBeInTheDocument();
	});

	it("calls onOpenPrivacy when manage button is clicked", () => {
		const handleOpenPrivacy = vi.fn();
		render(<Footer onOpenPrivacy={handleOpenPrivacy} />);

		const manageButton = screen.getByText("privacy.analytics.manage");
		fireEvent.click(manageButton);
		expect(handleOpenPrivacy).toHaveBeenCalledTimes(1);
	});
});
