import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ---- Hoisted spies shared between mock factories and the tests ----
const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: "nl", changeLanguage: vi.fn() },
	}),
}));

vi.mock("@/context/ToastContext", () => ({
	useToast: () => ({ showToast }),
}));

vi.mock("@/utils/adminData", () => ({
	fetchRedirects: vi.fn(),
	saveRedirects: vi.fn(),
	AuthError: class AuthError extends Error {},
}));

// The QrCode atom drives the `qrcode` lib against a <canvas>, which jsdom
// cannot render. Mock the lib so the atom mounts without touching canvas 2d.
vi.mock("qrcode", () => ({
	default: {
		toCanvas: vi.fn(() => Promise.resolve()),
		toDataURL: vi.fn(() => Promise.resolve("data:image/png;base64,AAAA")),
		toString: vi.fn(() => Promise.resolve("<svg></svg>")),
	},
}));

import { RedirectsEditor } from "@/pages/admin/views/RedirectsEditor";
import { AuthError, fetchRedirects, saveRedirects } from "@/utils/adminData";

const fetchRedirectsMock = vi.mocked(fetchRedirects);
const saveRedirectsMock = vi.mocked(saveRedirects);

const sampleRedirects: RedirectsData = {
	redirects: [
		{
			slug: "flyer",
			url: "https://example.com",
			label: "Summer flyer",
			scans: 12,
		},
	],
};

function renderEditor() {
	const onBack = vi.fn();
	const onLogout = vi.fn();
	const utils = render(<RedirectsEditor onBack={onBack} onLogout={onLogout} />);
	return { ...utils, onBack, onLogout };
}

beforeEach(() => {
	localStorage.setItem("band_admin_token", "tok-123");
	fetchRedirectsMock.mockResolvedValue({ redirects: [] });
	saveRedirectsMock.mockResolvedValue(undefined as never);
	// navigator.clipboard is not implemented in jsdom.
	Object.defineProperty(navigator, "clipboard", {
		value: { writeText: vi.fn(() => Promise.resolve()) },
		configurable: true,
		writable: true,
	});
	// downloadQrSvg relies on object URLs (absent in jsdom). Assign onto the
	// real URL so `new URL(...)` in validate() keeps working.
	URL.createObjectURL = vi.fn(() => "blob:mock");
	URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
	localStorage.clear();
	vi.clearAllMocks();
	vi.unstubAllGlobals();
});

describe("RedirectsEditor", () => {
	it("shows a loading spinner before data arrives, then the empty state", async () => {
		let resolve!: (v: RedirectsData) => void;
		fetchRedirectsMock.mockReturnValue(
			new Promise<RedirectsData>((r) => {
				resolve = r;
			}),
		);

		const { container } = renderEditor();
		// Spinner (animate-spin) is shown while loading.
		expect(container.querySelector(".animate-spin")).toBeInTheDocument();

		resolve({ redirects: [] });
		expect(
			await screen.findByText("admin.redirects.empty"),
		).toBeInTheDocument();
	});

	it("renders the existing list of redirects", async () => {
		fetchRedirectsMock.mockResolvedValue(sampleRedirects);
		renderEditor();

		expect(await screen.findByText("/flyer")).toBeInTheDocument();
		expect(
			screen.getByText(/Summer flyer · https:\/\/example\.com/),
		).toBeInTheDocument();
		expect(screen.getByText("admin.redirects.scans")).toBeInTheDocument();
		// Empty state must NOT show when there are rows.
		expect(screen.queryByText("admin.redirects.empty")).not.toBeInTheDocument();
	});

	it("shows a toast when loading fails", async () => {
		fetchRedirectsMock.mockRejectedValue(new Error("boom"));
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		renderEditor();

		await waitFor(() =>
			expect(showToast).toHaveBeenCalledWith(
				"admin.redirects.load_error",
				"error",
			),
		);
		errSpy.mockRestore();
	});

	it("adds a new row (expanded) with the QR placeholder until a slug exists", async () => {
		renderEditor();
		await screen.findByText("admin.redirects.empty");

		fireEvent.click(screen.getByText("admin.redirects.new_button"));

		// The new row is expanded: its slug/url inputs are visible.
		expect(
			screen.getByLabelText("admin.redirects.fields.slug"),
		).toBeInTheDocument();
		// No slug yet -> QR placeholder prompt.
		expect(screen.getByText("admin.redirects.need_slug")).toBeInTheDocument();
		// Empty state gone now that a row exists.
		expect(screen.queryByText("admin.redirects.empty")).not.toBeInTheDocument();
	});

	it("sanitizes the slug as the user types and renders the encoded URL + QR", async () => {
		renderEditor();
		await screen.findByText("admin.redirects.empty");
		fireEvent.click(screen.getByText("admin.redirects.new_button"));

		const slugInput = screen.getByLabelText(
			"admin.redirects.fields.slug",
		) as HTMLInputElement;
		fireEvent.change(slugInput, { target: { value: "Summer Flyer!!" } });
		expect(slugInput.value).toBe("summer-flyer");

		// Encoded URL uses the qr base + sanitized slug.
		expect(
			screen.getByText("https://go.pretband.nl/r/summer-flyer"),
		).toBeInTheDocument();
		// QR download buttons appear once a slug is set.
		expect(screen.getByText("PNG")).toBeInTheDocument();
		expect(screen.getByText("SVG")).toBeInTheDocument();
	});

	it("applies a quick-insert internal target to the destination URL", async () => {
		renderEditor();
		await screen.findByText("admin.redirects.empty");
		fireEvent.click(screen.getByText("admin.redirects.new_button"));

		fireEvent.click(screen.getByText("admin.redirects.targets.agenda"));

		const urlInput = screen.getByLabelText(
			"admin.redirects.fields.url",
		) as HTMLInputElement;
		expect(urlInput.value).toContain("/#/#agenda");
	});

	it("edits the label of an existing row", async () => {
		fetchRedirectsMock.mockResolvedValue(sampleRedirects);
		renderEditor();

		// Expand the row by clicking its header.
		fireEvent.click(await screen.findByText("/flyer"));

		const labelInput = screen.getByLabelText(
			"admin.redirects.fields.label",
		) as HTMLInputElement;
		expect(labelInput.value).toBe("Summer flyer");
		fireEvent.change(labelInput, { target: { value: "Autumn flyer" } });
		expect(labelInput.value).toBe("Autumn flyer");
	});

	it("removes a row and falls back to the empty state", async () => {
		fetchRedirectsMock.mockResolvedValue(sampleRedirects);
		renderEditor();

		fireEvent.click(await screen.findByText("/flyer"));
		fireEvent.click(screen.getByText("admin.redirects.delete_button"));

		expect(screen.queryByText("/flyer")).not.toBeInTheDocument();
		expect(screen.getByText("admin.redirects.empty")).toBeInTheDocument();
	});

	it("copies the encoded URL to the clipboard", async () => {
		fetchRedirectsMock.mockResolvedValue(sampleRedirects);
		renderEditor();
		fireEvent.click(await screen.findByText("/flyer"));

		fireEvent.click(screen.getByTitle("admin.redirects.copy"));

		await waitFor(() =>
			expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
				"https://go.pretband.nl/r/flyer",
			),
		);
		expect(showToast).toHaveBeenCalledWith("admin.redirects.copied", "success");
	});

	it("reports a copy failure via toast", async () => {
		fetchRedirectsMock.mockResolvedValue(sampleRedirects);
		Object.defineProperty(navigator, "clipboard", {
			value: { writeText: vi.fn(() => Promise.reject(new Error("nope"))) },
			configurable: true,
			writable: true,
		});
		renderEditor();
		fireEvent.click(await screen.findByText("/flyer"));

		fireEvent.click(screen.getByTitle("admin.redirects.copy"));

		await waitFor(() =>
			expect(showToast).toHaveBeenCalledWith(
				"admin.redirects.copy_error",
				"error",
			),
		);
	});

	it("triggers PNG and SVG downloads", async () => {
		const qrcode = (await import("qrcode")).default;
		fetchRedirectsMock.mockResolvedValue(sampleRedirects);
		renderEditor();
		fireEvent.click(await screen.findByText("/flyer"));

		fireEvent.click(screen.getByText("PNG"));
		await waitFor(() => expect(qrcode.toDataURL).toHaveBeenCalled());

		fireEvent.click(screen.getByText("SVG"));
		await waitFor(() => expect(qrcode.toString).toHaveBeenCalled());
	});

	it("blocks save on an invalid slug", async () => {
		renderEditor();
		await screen.findByText("admin.redirects.empty");
		fireEvent.click(screen.getByText("admin.redirects.new_button"));
		// slug left empty -> invalid
		const urlInput = screen.getByLabelText("admin.redirects.fields.url");
		fireEvent.change(urlInput, { target: { value: "https://example.com" } });

		fireEvent.click(screen.getByText("admin.members.save_cloud"));

		await waitFor(() =>
			expect(showToast).toHaveBeenCalledWith(
				"admin.redirects.invalid_slug",
				"error",
			),
		);
		expect(saveRedirectsMock).not.toHaveBeenCalled();
	});

	it("blocks save on an invalid destination URL", async () => {
		renderEditor();
		await screen.findByText("admin.redirects.empty");
		fireEvent.click(screen.getByText("admin.redirects.new_button"));

		fireEvent.change(screen.getByLabelText("admin.redirects.fields.slug"), {
			target: { value: "flyer" },
		});
		fireEvent.change(screen.getByLabelText("admin.redirects.fields.url"), {
			target: { value: "not-a-url" },
		});

		fireEvent.click(screen.getByText("admin.members.save_cloud"));

		await waitFor(() =>
			expect(showToast).toHaveBeenCalledWith(
				"admin.redirects.invalid_url",
				"error",
			),
		);
		expect(saveRedirectsMock).not.toHaveBeenCalled();
	});

	it("blocks save on duplicate slugs", async () => {
		fetchRedirectsMock.mockResolvedValue({
			redirects: [
				{ slug: "flyer", url: "https://a.com" },
				{ slug: "flyer", url: "https://b.com" },
			],
		});
		renderEditor();
		await screen.findAllByText("/flyer");

		fireEvent.click(screen.getByText("admin.members.save_cloud"));

		await waitFor(() =>
			expect(showToast).toHaveBeenCalledWith(
				"admin.redirects.duplicate_slug",
				"error",
			),
		);
		expect(saveRedirectsMock).not.toHaveBeenCalled();
	});

	it("does nothing when there is no auth token", async () => {
		localStorage.removeItem("band_admin_token");
		fetchRedirectsMock.mockResolvedValue(sampleRedirects);
		renderEditor();
		await screen.findByText("/flyer");

		fireEvent.click(screen.getByText("admin.members.save_cloud"));

		expect(saveRedirectsMock).not.toHaveBeenCalled();
		expect(showToast).not.toHaveBeenCalled();
	});

	it("saves valid rows, refetches and shows the success toast", async () => {
		fetchRedirectsMock.mockResolvedValue(sampleRedirects);
		renderEditor();
		await screen.findByText("/flyer");

		fireEvent.click(screen.getByText("admin.members.save_cloud"));

		await waitFor(() =>
			expect(saveRedirectsMock).toHaveBeenCalledWith("tok-123", {
				redirects: [
					{ slug: "flyer", url: "https://example.com", label: "Summer flyer" },
				],
			}),
		);
		await waitFor(() =>
			expect(showToast).toHaveBeenCalledWith(
				"admin.toasts.redirects_success",
				"success",
			),
		);
		// Refetch after save: fetch called on mount + once more.
		expect(fetchRedirectsMock.mock.calls.length).toBeGreaterThanOrEqual(2);
	});

	it("logs out on an AuthError during save", async () => {
		fetchRedirectsMock.mockResolvedValue(sampleRedirects);
		saveRedirectsMock.mockRejectedValue(new AuthError());
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const { onLogout } = renderEditor();
		await screen.findByText("/flyer");

		fireEvent.click(screen.getByText("admin.members.save_cloud"));

		await waitFor(() =>
			expect(showToast).toHaveBeenCalledWith(
				"admin.toasts.session_expired",
				"error",
			),
		);
		expect(onLogout).toHaveBeenCalled();
		errSpy.mockRestore();
	});

	it("shows a generic error toast on a save failure", async () => {
		fetchRedirectsMock.mockResolvedValue(sampleRedirects);
		saveRedirectsMock.mockRejectedValue(new Error("500"));
		const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const { onLogout } = renderEditor();
		await screen.findByText("/flyer");

		fireEvent.click(screen.getByText("admin.members.save_cloud"));

		await waitFor(() =>
			expect(showToast).toHaveBeenCalledWith(
				"admin.toasts.save_error",
				"error",
			),
		);
		expect(onLogout).not.toHaveBeenCalled();
		errSpy.mockRestore();
	});

	it("invokes onBack from the top bar", async () => {
		fetchRedirectsMock.mockResolvedValue(sampleRedirects);
		const { onBack } = renderEditor();
		await screen.findByText("/flyer");

		// The back button is the first ghost button in the top bar.
		const buttons = screen.getAllByRole("button");
		fireEvent.click(buttons[0]);
		expect(onBack).toHaveBeenCalled();
	});

	it("collapses an expanded row when its header is clicked again", async () => {
		fetchRedirectsMock.mockResolvedValue(sampleRedirects);
		renderEditor();

		const header = await screen.findByText("/flyer");
		fireEvent.click(header);
		expect(
			screen.getByLabelText("admin.redirects.fields.slug"),
		).toBeInTheDocument();

		fireEvent.click(header);
		expect(
			screen.queryByLabelText("admin.redirects.fields.slug"),
		).not.toBeInTheDocument();
	});

	it("shows the 'no destination yet' hint for a row without a URL", async () => {
		fetchRedirectsMock.mockResolvedValue({
			redirects: [{ slug: "empty", url: "" }],
		});
		const { container } = renderEditor();
		await screen.findByText("/empty");
		expect(
			within(container).getByText("admin.redirects.no_target"),
		).toBeInTheDocument();
	});
});
