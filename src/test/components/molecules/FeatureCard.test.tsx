import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FeatureCard } from "@/components/ui/molecules/FeatureCard";

describe("FeatureCard Component", () => {
	it("renders title and description", () => {
		render(<FeatureCard title="Feature 1" description="Description 1" />);
		expect(screen.getByText("Feature 1")).toBeInTheDocument();
		expect(screen.getByText("Description 1")).toBeInTheDocument();
	});

	it("applies variant classes", () => {
		const { container } = render(
			<FeatureCard title="T" description="D" variant="dark" />,
		);
		expect(container.firstChild).toHaveClass("bg-pret-dark");
	});
});
