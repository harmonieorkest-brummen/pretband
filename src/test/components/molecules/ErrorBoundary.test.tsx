import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ErrorBoundary } from "@/components/ui/molecules/ErrorBoundary";

// Mock i18next
vi.mock("@/i18n", () => ({
	default: {
		t: (key: string) => key,
	},
}));

const ThrowError = () => {
	throw new Error("Test error");
};

describe("ErrorBoundary Component", () => {
	it("renders children when no error occurs", () => {
		render(
			<ErrorBoundary>
				<div data-testid="child">Child Content</div>
			</ErrorBoundary>,
		);
		expect(screen.getByTestId("child")).toBeInTheDocument();
	});

	it("renders fallback UI when an error occurs", () => {
		// Suppress console.error for expected error
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		render(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>,
		);

		expect(screen.getByText("errors.boundary_title")).toBeInTheDocument();
		expect(screen.getByText("errors.boundary_body")).toBeInTheDocument();
		expect(screen.getByRole("button")).toHaveTextContent("errors.boundary_button");

		consoleSpy.mockRestore();
	});

	it("renders custom fallback when provided", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});

		render(
			<ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Fallback</div>}>
				<ThrowError />
			</ErrorBoundary>,
		);

		expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
	});
});
