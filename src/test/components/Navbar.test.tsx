import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Navbar } from "@/components/layout/Navbar";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: {
			language: "nl",
			changeLanguage: vi.fn(),
		},
	}),
}));

vi.mock("@/config/featureFlags", () => ({
	FEATURE_FLAGS: {
		ABOUT: true,
		MEMBERS: true,
		AGENDA: true,
		CONTACT: true,
	},
}));

describe("Navbar Component", () => {
	it("renders correctly with feature flags on", () => {
		render(<Navbar />);

		const bandLinks = screen.getAllByText("navbar.band");
		expect(bandLinks.length).toBeGreaterThan(0);

		const membersLinks = screen.getAllByText("navbar.members");
		expect(membersLinks.length).toBeGreaterThan(0);
	});

	it("uses HashRouter-safe section hrefs", () => {
		render(<Navbar />);

		expect(screen.getAllByText("navbar.band")[0].closest("a")).toHaveAttribute(
			"href",
			"#/#wie",
		);
		expect(
			screen.getAllByText("navbar.members")[0].closest("a"),
		).toHaveAttribute("href", "#/#leden");
		expect(screen.getAllByText("navbar.when")[0].closest("a")).toHaveAttribute(
			"href",
			"#/#agenda",
		);
		expect(
			screen.getAllByText("navbar.book_now")[0].closest("a"),
		).toHaveAttribute("href", "#/#contact");
	});

	it("toggles mobile menu when menu button is clicked", () => {
		render(<Navbar />);

		const openButton = screen.getByLabelText("navbar.open_menu");
		fireEvent.click(openButton);

		const closeButtons = screen.getAllByLabelText("navbar.close_menu");
		expect(closeButtons.length).toBeGreaterThan(0);
	});
});
