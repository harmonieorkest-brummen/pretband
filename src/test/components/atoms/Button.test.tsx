import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/atoms/Button";

describe("Button Component", () => {
	it("renders as a button by default", () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole("button", { name: /click me/i });
		expect(button).toBeInTheDocument();
		expect(button).toHaveAttribute("type", "button");
	});

	it("renders as a link when href is provided", () => {
		render(<Button href="https://example.com">Go to example</Button>);
		const link = screen.getByRole("link", { name: /go to example/i });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "https://example.com");
	});

	it("calls onClick when clicked", () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Click me</Button>);
		fireEvent.click(screen.getByRole("button"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("is disabled when disabled prop is true", () => {
		render(<Button disabled>Disabled</Button>);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("applies variant classes", () => {
		render(<Button variant="secondary">Secondary</Button>);
		expect(screen.getByRole("button")).toHaveClass("bg-pret-red");
	});
});
