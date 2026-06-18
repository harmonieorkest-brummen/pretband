import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Gallery } from "@/components/sections/Gallery";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock("@/utils/adminData", () => ({
	fetchGallery: vi.fn(() => Promise.resolve(["image1.jpg", "image2.jpg"])),
}));

describe("Gallery Component", () => {
	it("renders the gallery section and images", async () => {
		render(<Gallery />);

		expect(screen.getByText("gallery.title")).toBeInTheDocument();
		expect(screen.getByText("gallery.description")).toBeInTheDocument();

		await waitFor(() => {
			const images = screen.getAllByRole("img");
			expect(images).toHaveLength(2);
		});
	});

	it("opens the lightbox when an image is clicked", async () => {
		render(<Gallery />);

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(0);
		});

		const buttons = screen.getAllByRole("button");
		fireEvent.click(buttons[0]);

		expect(screen.getByAltText("Gallery full view")).toBeInTheDocument();
		expect(screen.getByText("1 / 2")).toBeInTheDocument();
	});
});
