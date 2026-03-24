import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Decoration } from "@/components/ui/atoms/Decoration";

// Mock the context hook
vi.mock("../../../context/EasterEggContext", () => ({
	useEasterEggs: () => ({
		foundEggs: [],
		findEgg: vi.fn(),
		isAllFound: false,
		resetEggs: vi.fn(),
	}),
}));

describe("Decoration Component", () => {
	it("renders correctly with default props", () => {
		render(<Decoration type="star" />);
		const decoration = screen.getByTestId("decoration");
		expect(decoration).toBeInTheDocument();
		expect(decoration).toHaveClass("pointer-events-none");
	});

	it("applies custom className", () => {
		render(<Decoration type="star" className="custom-test-class" />);
		const decoration = screen.getByTestId("decoration");
		expect(decoration).toHaveClass("custom-test-class");
	});
});
