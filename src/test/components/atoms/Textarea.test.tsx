import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Textarea } from "@/components/ui/atoms/Textarea";

describe("Textarea Component", () => {
	it("renders correctly with placeholder", () => {
		render(<Textarea placeholder="Enter your message" />);
		expect(screen.getByPlaceholderText("Enter your message")).toBeInTheDocument();
	});

	it("renders label when provided", () => {
		render(<Textarea label="Message" id="message-input" />);
		expect(screen.getByLabelText("Message")).toBeInTheDocument();
		expect(screen.getByLabelText("Message")).toHaveAttribute("id", "message-input");
	});

	it("calls onChange when value changes", () => {
		const handleChange = vi.fn();
		render(<Textarea onChange={handleChange} />);
		const textarea = screen.getByRole("textbox");
		fireEvent.change(textarea, { target: { value: "Hello world" } });
		expect(handleChange).toHaveBeenCalledTimes(1);
	});

	it("applies custom className", () => {
		render(<Textarea className="custom-textarea-class" />);
		expect(screen.getByRole("textbox")).toHaveClass("custom-textarea-class");
	});
});
