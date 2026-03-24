import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading } from "@/components/ui/atoms/Heading";

describe("Heading Component", () => {
	it("renders as h2 by default", () => {
		render(<Heading>Default Heading</Heading>);
		const heading = screen.getByRole("heading", { level: 2 });
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveTextContent("Default Heading");
	});

	it("renders different levels", () => {
		const { rerender } = render(<Heading level={1}>H1 Heading</Heading>);
		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();

		rerender(<Heading level={3}>H3 Heading</Heading>);
		expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
	});

	it("applies variant classes", () => {
		render(<Heading variant="yellow">Yellow Heading</Heading>);
		expect(screen.getByRole("heading")).toHaveClass("text-pret-yellow");
	});

	it("applies glow classes when enabled", () => {
		render(
			<Heading variant="yellow" glow>
				Glowing Heading
			</Heading>,
		);
		expect(screen.getByRole("heading")).toHaveClass("text-glow-yellow");
	});
});
