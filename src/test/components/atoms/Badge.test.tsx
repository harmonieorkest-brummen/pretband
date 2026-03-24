import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/atoms/Badge";

describe("Badge Component", () => {
	it("renders children correctly", () => {
		render(<Badge>Test Badge</Badge>);
		expect(screen.getByText("Test Badge")).toBeInTheDocument();
	});

	it("applies variant classes correctly", () => {
		const { rerender } = render(<Badge variant="red">Red</Badge>);
		expect(screen.getByText("Red")).toHaveClass("bg-[#D42A29]");

		rerender(<Badge variant="yellow">Yellow</Badge>);
		expect(screen.getByText("Yellow")).toHaveClass("bg-pret-yellow");
	});

	it("applies size classes correctly", () => {
		const { rerender } = render(<Badge size="sm">Small</Badge>);
		expect(screen.getByText("Small")).toHaveClass("text-sm");

		rerender(<Badge size="xl">Extra Large</Badge>);
		expect(screen.getByText("Extra Large")).toHaveClass("text-4xl");
	});

	it("applies custom className", () => {
		render(<Badge className="custom-class">Custom</Badge>);
		expect(screen.getByText("Custom")).toHaveClass("custom-class");
	});
});
