import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Hero } from "@/components/sections/Hero";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
	Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

vi.mock("@/context/EasterEggContext", () => ({
	useEasterEggs: () => ({
		findEgg: vi.fn(),
	}),
}));

describe("Hero Component", () => {
	it("renders the hero section with logo and text", () => {
		const handleLaunchConfetti = vi.fn();
		render(<Hero onLaunchConfetti={handleLaunchConfetti} />);

		expect(screen.getByAltText("Pretband Logo")).toBeInTheDocument();
		expect(screen.getByText("hero.narrative")).toBeInTheDocument();
		expect(screen.getByText("hero.book_now")).toBeInTheDocument();
	});

	it("uses HashRouter-safe section hrefs", () => {
		const handleLaunchConfetti = vi.fn();
		render(<Hero onLaunchConfetti={handleLaunchConfetti} />);

		expect(screen.getByText("hero.book_now").closest("a")).toHaveAttribute(
			"href",
			"#/#contact",
		);
		expect(screen.getByText("hero.check_chaos").closest("a")).toHaveAttribute(
			"href",
			"#/#agenda",
		);
	});

	it("calls onLaunchConfetti when logo is clicked", () => {
		const handleLaunchConfetti = vi.fn();
		render(<Hero onLaunchConfetti={handleLaunchConfetti} />);

		const logoButton = screen.getByRole("button");
		fireEvent.click(logoButton);

		expect(handleLaunchConfetti).toHaveBeenCalledTimes(1);
	});
});
