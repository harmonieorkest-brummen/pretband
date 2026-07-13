import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import imageCompression from "browser-image-compression";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GalleryEditor } from "@/pages/admin/views/GalleryEditor";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: "nl", changeLanguage: vi.fn() },
	}),
	Trans: ({ children }: { children: React.ReactNode }) => children,
	initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

const { showToastMock } = vi.hoisted(() => ({ showToastMock: vi.fn() }));

vi.mock("@/context/ToastContext", () => ({
	useToast: () => ({ showToast: showToastMock }),
}));

const {
	fetchGalleryMock,
	uploadGalleryImageMock,
	deleteGalleryImageMock,
	AuthErrorClass,
} = vi.hoisted(() => {
	class AuthError extends Error {}
	return {
		fetchGalleryMock: vi.fn(),
		uploadGalleryImageMock: vi.fn(),
		deleteGalleryImageMock: vi.fn(),
		AuthErrorClass: AuthError,
	};
});

vi.mock("@/utils/adminData", () => ({
	fetchGallery: fetchGalleryMock,
	uploadGalleryImage: uploadGalleryImageMock,
	deleteGalleryImage: deleteGalleryImageMock,
	AuthError: AuthErrorClass,
}));

vi.mock("browser-image-compression", () => ({
	default: vi.fn(async (f: File) => f),
}));

const compressionMock = vi.mocked(imageCompression);

function renderEditor(
	overrides: { onBack?: () => void; onLogout?: () => void } = {},
) {
	const onBack = overrides.onBack ?? vi.fn();
	const onLogout = overrides.onLogout ?? vi.fn();
	const result = render(<GalleryEditor onBack={onBack} onLogout={onLogout} />);
	return { onBack, onLogout, ...result };
}

function getFileInput(container: HTMLElement): HTMLInputElement {
	const input = container.querySelector('input[type="file"]');
	if (!input) throw new Error("file input not found");
	return input as HTMLInputElement;
}

function setFiles(input: HTMLInputElement, files: File[]) {
	Object.defineProperty(input, "files", { value: files, configurable: true });
}

beforeEach(() => {
	localStorage.setItem("band_admin_token", "test-token");
	fetchGalleryMock.mockResolvedValue([]);
	uploadGalleryImageMock.mockResolvedValue({ url: "https://cdn/new.jpg" });
	deleteGalleryImageMock.mockResolvedValue(undefined);
	compressionMock.mockImplementation(async (f: File) => f);
});

afterEach(() => {
	vi.clearAllMocks();
	localStorage.clear();
});

describe("GalleryEditor", () => {
	it("shows a loading spinner while images are being fetched", async () => {
		let resolve!: (v: string[]) => void;
		fetchGalleryMock.mockReturnValue(
			new Promise<string[]>((r) => {
				resolve = r;
			}),
		);
		const { container } = renderEditor();

		expect(container.querySelector(".animate-spin")).toBeInTheDocument();

		resolve([]);
		await waitFor(() =>
			expect(container.querySelector(".animate-spin")).not.toBeInTheDocument(),
		);
	});

	it("renders fetched gallery images", async () => {
		fetchGalleryMock.mockResolvedValue([
			"https://cdn/a.jpg",
			"https://cdn/b.jpg",
		]);
		renderEditor();

		await waitFor(() =>
			expect(screen.getAllByAltText("Gallery item")).toHaveLength(2),
		);
		const imgs = screen.getAllByAltText("Gallery item") as HTMLImageElement[];
		expect(imgs.map((i) => i.getAttribute("src"))).toEqual([
			"https://cdn/a.jpg",
			"https://cdn/b.jpg",
		]);
	});

	it("shows the empty state when there are no images", async () => {
		fetchGalleryMock.mockResolvedValue([]);
		renderEditor();

		await waitFor(() =>
			expect(screen.getByText("admin.gallery.empty")).toBeInTheDocument(),
		);
	});

	it("shows an error toast when loading the gallery fails", async () => {
		fetchGalleryMock.mockRejectedValue(new Error("boom"));
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		renderEditor();

		await waitFor(() =>
			expect(showToastMock).toHaveBeenCalledWith(
				"admin.gallery.load_error",
				"error",
			),
		);
		errSpy.mockRestore();
	});

	it("uploads a selected image and prepends it to the grid", async () => {
		fetchGalleryMock.mockResolvedValue(["https://cdn/existing.jpg"]);
		const { container } = renderEditor();

		await waitFor(() =>
			expect(screen.getAllByAltText("Gallery item")).toHaveLength(1),
		);

		const input = getFileInput(container);
		const file = new File(["hello"], "photo.jpg", { type: "image/jpeg" });
		setFiles(input, [file]);
		fireEvent.change(input);

		await waitFor(() =>
			expect(uploadGalleryImageMock).toHaveBeenCalledWith(
				"test-token",
				"photo.jpg",
				"image/jpeg",
				expect.any(String),
			),
		);

		// base64 of "hello" is "aGVsbG8="
		expect(uploadGalleryImageMock.mock.calls[0][3]).toBe("aGVsbG8=");
		expect(compressionMock).toHaveBeenCalledWith(
			file,
			expect.objectContaining({ maxSizeMB: 1, maxWidthOrHeight: 1920 }),
		);

		await waitFor(() =>
			expect(screen.getAllByAltText("Gallery item")).toHaveLength(2),
		);
		const imgs = screen.getAllByAltText("Gallery item") as HTMLImageElement[];
		expect(imgs[0].getAttribute("src")).toBe("https://cdn/new.jpg");
		expect(showToastMock).toHaveBeenCalledWith(
			"admin.gallery.upload_success",
			"success",
		);
		// input value is reset after upload
		expect(input.value).toBe("");
	});

	it("rejects unsupported file types without uploading", async () => {
		const { container } = renderEditor();
		await waitFor(() =>
			expect(screen.getByText("admin.gallery.empty")).toBeInTheDocument(),
		);

		const input = getFileInput(container);
		const file = new File(["x"], "movie.gif", { type: "image/gif" });
		setFiles(input, [file]);
		fireEvent.change(input);

		await waitFor(() =>
			expect(showToastMock).toHaveBeenCalledWith(
				"admin.gallery.unsupported_typeimage/gif",
				"error",
			),
		);
		expect(uploadGalleryImageMock).not.toHaveBeenCalled();
	});

	it("triggers the hidden file input when clicking the select button", async () => {
		const { container } = renderEditor();
		await waitFor(() =>
			expect(screen.getByText("admin.gallery.empty")).toBeInTheDocument(),
		);

		const input = getFileInput(container);
		const clickSpy = vi.spyOn(input, "click").mockImplementation(() => {});
		fireEvent.click(screen.getByText("admin.gallery.select_files"));
		expect(clickSpy).toHaveBeenCalled();
	});

	it("logs out when uploading fails with an AuthError", async () => {
		uploadGalleryImageMock.mockRejectedValue(new AuthErrorClass("expired"));
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const { container, onLogout } = renderEditor();
		await waitFor(() =>
			expect(screen.getByText("admin.gallery.empty")).toBeInTheDocument(),
		);

		const input = getFileInput(container);
		setFiles(input, [new File(["h"], "p.png", { type: "image/png" })]);
		fireEvent.change(input);

		await waitFor(() => expect(onLogout).toHaveBeenCalled());
		expect(showToastMock).toHaveBeenCalledWith(
			"admin.toasts.session_expired",
			"error",
		);
		errSpy.mockRestore();
	});

	it("shows a generic error toast when uploading fails", async () => {
		uploadGalleryImageMock.mockRejectedValue(new Error("network"));
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const { container, onLogout } = renderEditor();
		await waitFor(() =>
			expect(screen.getByText("admin.gallery.empty")).toBeInTheDocument(),
		);

		const input = getFileInput(container);
		setFiles(input, [new File(["h"], "p.webp", { type: "image/webp" })]);
		fireEvent.change(input);

		await waitFor(() =>
			expect(showToastMock).toHaveBeenCalledWith(
				"admin.gallery.upload_error",
				"error",
			),
		);
		expect(onLogout).not.toHaveBeenCalled();
		errSpy.mockRestore();
	});

	it("does nothing on change when no files are selected", async () => {
		const { container } = renderEditor();
		await waitFor(() =>
			expect(screen.getByText("admin.gallery.empty")).toBeInTheDocument(),
		);

		const input = getFileInput(container);
		setFiles(input, []);
		fireEvent.change(input);

		expect(compressionMock).not.toHaveBeenCalled();
		expect(uploadGalleryImageMock).not.toHaveBeenCalled();
	});

	it("deletes an image after confirmation", async () => {
		fetchGalleryMock.mockResolvedValue([
			"https://cdn/a.jpg",
			"https://cdn/b.jpg",
		]);
		const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
		renderEditor();

		await waitFor(() =>
			expect(screen.getAllByAltText("Gallery item")).toHaveLength(2),
		);

		fireEvent.click(screen.getAllByTitle("admin.gallery.delete")[0]);

		await waitFor(() =>
			expect(deleteGalleryImageMock).toHaveBeenCalledWith(
				"test-token",
				"https://cdn/a.jpg",
			),
		);
		await waitFor(() =>
			expect(screen.getAllByAltText("Gallery item")).toHaveLength(1),
		);
		expect(showToastMock).toHaveBeenCalledWith(
			"admin.gallery.delete_success",
			"success",
		);
		confirmSpy.mockRestore();
	});

	it("does not delete when the confirmation is cancelled", async () => {
		fetchGalleryMock.mockResolvedValue(["https://cdn/a.jpg"]);
		const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
		renderEditor();

		await waitFor(() =>
			expect(screen.getAllByAltText("Gallery item")).toHaveLength(1),
		);

		fireEvent.click(screen.getByTitle("admin.gallery.delete"));
		expect(deleteGalleryImageMock).not.toHaveBeenCalled();
		confirmSpy.mockRestore();
	});

	it("logs out when deleting fails with an AuthError", async () => {
		fetchGalleryMock.mockResolvedValue(["https://cdn/a.jpg"]);
		deleteGalleryImageMock.mockRejectedValue(new AuthErrorClass("expired"));
		const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
		const { onLogout } = renderEditor();

		await waitFor(() =>
			expect(screen.getAllByAltText("Gallery item")).toHaveLength(1),
		);
		fireEvent.click(screen.getByTitle("admin.gallery.delete"));

		await waitFor(() => expect(onLogout).toHaveBeenCalled());
		expect(showToastMock).toHaveBeenCalledWith(
			"admin.toasts.session_expired",
			"error",
		);
		confirmSpy.mockRestore();
	});

	it("shows a generic error toast when deleting fails", async () => {
		fetchGalleryMock.mockResolvedValue(["https://cdn/a.jpg"]);
		deleteGalleryImageMock.mockRejectedValue(new Error("network"));
		const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
		const { onLogout } = renderEditor();

		await waitFor(() =>
			expect(screen.getAllByAltText("Gallery item")).toHaveLength(1),
		);
		fireEvent.click(screen.getByTitle("admin.gallery.delete"));

		await waitFor(() =>
			expect(showToastMock).toHaveBeenCalledWith(
				"admin.gallery.delete_error",
				"error",
			),
		);
		expect(onLogout).not.toHaveBeenCalled();
		confirmSpy.mockRestore();
	});

	it("does not attempt deletion when there is no admin token", async () => {
		localStorage.removeItem("band_admin_token");
		fetchGalleryMock.mockResolvedValue(["https://cdn/a.jpg"]);
		const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
		renderEditor();

		await waitFor(() =>
			expect(screen.getAllByAltText("Gallery item")).toHaveLength(1),
		);
		fireEvent.click(screen.getByTitle("admin.gallery.delete"));

		expect(confirmSpy).not.toHaveBeenCalled();
		expect(deleteGalleryImageMock).not.toHaveBeenCalled();
		confirmSpy.mockRestore();
	});
});
