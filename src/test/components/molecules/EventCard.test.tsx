import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EventCard } from "@/components/ui/molecules/EventCard";

describe("EventCard Component", () => {
	const defaultProps = {
		date: "2024-05-20",
		title: "Test Concert",
		location: "The Park",
		time: "20:00",
		status: "Confirmed",
	};

	it("renders event details correctly", () => {
		render(<EventCard {...defaultProps} />);
		expect(screen.getByText(defaultProps.date)).toBeInTheDocument();
		expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
		expect(screen.getByText(defaultProps.location)).toBeInTheDocument();
		expect(screen.getByText(defaultProps.time)).toBeInTheDocument();
		expect(screen.getByText(defaultProps.status)).toBeInTheDocument();
	});

	it("does not render time if it is 'TBA'", () => {
		render(<EventCard {...defaultProps} time="TBA" />);
		expect(screen.queryByText("TBA")).not.toBeInTheDocument();
	});

	it("applies variant classes", () => {
		const { container } = render(<EventCard {...defaultProps} variant="red" />);
		expect(container.firstChild).toHaveClass("hover:bg-pret-red");
	});
});
