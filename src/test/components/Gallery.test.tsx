import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Gallery } from "@/components/sections/Gallery";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock("@/utils/adminData", () => ({
	fetchGallery: vi.fn(() =>
		Promise.resolve([
			"https://blob.vercel-storage.com/gallery/1234-pretband-optreden.jpg",
			"https://blob.vercel-storage.com/gallery/5678-concert-foto.png",
		]),
	),
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

		expect(screen.getByAltText("Pretband optreden")).toBeInTheDocument();
		expect(screen.getByAltText("Concert foto")).toBeInTheDocument();
	});

	it("opens the lightbox when an image is clicked", async () => {
		render(<Gallery />);

		await waitFor(() => {
			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(0);
		});

		const buttons = screen.getAllByRole("button");
		fireEvent.click(buttons[0]);

		// Lightbox uses the same altFromUrl for the full-view image
		const fullViewImages = screen.getAllByAltText("Pretband optreden");
		expect(fullViewImages.length).toBe(2); // thumbnail + lightbox
		expect(screen.getByText("1 / 2")).toBeInTheDocument();
	});
});
