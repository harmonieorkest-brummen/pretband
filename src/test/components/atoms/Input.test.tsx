import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Input } from "@/components/ui/atoms/Input";

describe("Input Component", () => {
	it("renders correctly with placeholder", () => {
		render(<Input placeholder="Enter your name" />);
		expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
	});

	it("renders label when provided", () => {
		render(<Input label="Name" id="name-input" />);
		expect(screen.getByLabelText("Name")).toBeInTheDocument();
		expect(screen.getByLabelText("Name")).toHaveAttribute("id", "name-input");
	});

	it("calls onChange when value changes", () => {
		const handleChange = vi.fn();
		render(<Input onChange={handleChange} />);
		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "John Doe" } });
		expect(handleChange).toHaveBeenCalledTimes(1);
	});

	it("applies custom className", () => {
		render(<Input className="custom-input-class" />);
		expect(screen.getByRole("textbox")).toHaveClass("custom-input-class");
	});

	it("renders as different types", () => {
		render(<Input type="email" placeholder="Email" />);
		expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email");
	});
});
