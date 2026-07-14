import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataProvider } from "@/context/DataContext";
import { ToastProvider } from "@/context/ToastContext";
import AdminPanel from "@/pages/admin/AdminPage";
import {
	AuthError,
	fetchAgenda,
	fetchGallery,
	fetchMembers,
	fetchRedirects,
	fetchStats,
	persistData,
	saveAgenda,
	saveMembers,
	saveTranslations,
} from "@/utils/adminData";

// i18n: the panel and every real child editor only consume `t`; return the key.
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: "nl", changeLanguage: vi.fn() },
	}),
	Trans: ({ children }: { children: React.ReactNode }) => children,
	initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

// The API layer is fully mocked; AuthError is a real subclass so the panel's
// `err instanceof AuthError` checks resolve against the same class.
vi.mock("@/utils/adminData", () => {
	class AuthError extends Error {
		constructor(message = "Unauthorized") {
			super(message);
			this.name = "AuthError";
		}
	}
	return {
		AuthError,
		fetchMembers: vi.fn(),
		fetchAgenda: vi.fn(),
		fetchGallery: vi.fn(),
		fetchRedirects: vi.fn(),
		fetchTranslations: vi.fn(),
		saveMembers: vi.fn(),
		saveAgenda: vi.fn(),
		saveTranslations: vi.fn(),
		saveRedirects: vi.fn(),
		uploadGalleryImage: vi.fn(),
		deleteGalleryImage: vi.fn(),
		persistData: vi.fn(),
		loadData: vi.fn(() => undefined),
		fetchStats: vi.fn(),
		trackEvent: vi.fn(),
	};
});

// Heavy browser-only deps pulled in by the real Gallery/Redirects editors.
vi.mock("qrcode", () => ({
	default: {
		toCanvas: vi.fn(async () => {}),
		toDataURL: vi.fn(async () => "data:image/png;base64,"),
	},
}));
vi.mock("browser-image-compression", () => ({
	default: vi.fn(async (file: unknown) => file),
}));

const TOKEN_KEY = "band_admin_token";

function renderAdmin() {
	return render(
		<ToastProvider>
			<DataProvider>
				<AdminPanel />
			</DataProvider>
		</ToastProvider>,
	);
}

async function renderAuthed() {
	localStorage.setItem(TOKEN_KEY, "seed-token");
	const utils = renderAdmin();
	await screen.findByText("admin.landing.title");
	return utils;
}

async function gotoView(tileKey: string, expectText: string) {
	const tile = screen
		.getByText(`admin.landing.${tileKey}_title`)
		.closest("button") as HTMLElement;
	fireEvent.click(tile);
	return screen.findByText(expectText);
}

describe("AdminPage (orchestrator)", () => {
	beforeEach(() => {
		vi.mocked(fetchMembers).mockResolvedValue({ sections: [] });
		vi.mocked(fetchAgenda).mockResolvedValue({ events: [] });
		vi.mocked(fetchGallery).mockResolvedValue([]);
		vi.mocked(fetchRedirects).mockResolvedValue({ redirects: [] });
		vi.mocked(saveMembers).mockResolvedValue({});
		vi.mocked(saveAgenda).mockResolvedValue({});
		vi.mocked(saveTranslations).mockResolvedValue({});
		vi.mocked(fetchStats).mockResolvedValue({
			qr: { totalScans: 0, topCode: null, codes: [] },
			confetti: { bursts: 0 },
			contact: { submissions: 0 },
			security: { failedLogins24h: 0, lastLogin: null },
			traffic: { connected: false, reason: "not_configured" },
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.unstubAllGlobals();
		localStorage.clear();
	});

	it("shows the LoginScreen when there is no token", () => {
		renderAdmin();
		expect(screen.getByText("admin.login.title")).toBeInTheDocument();
		expect(screen.queryByText("admin.landing.title")).not.toBeInTheDocument();
	});

	it("logs in through the LoginScreen and lands on the dashboard", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				ok: true,
				status: 200,
				json: async () => ({ token: "fresh-token" }),
			})),
		);
		renderAdmin();

		fireEvent.change(screen.getByLabelText("admin.login.password_label"), {
			target: { value: "hunter2" },
		});
		fireEvent.click(
			screen.getByRole("button", { name: "admin.login.login_button" }),
		);

		await screen.findByText("admin.landing.title");
		// handleLogin persisted the token under the key the panel reads back.
		expect(localStorage.getItem(TOKEN_KEY)).toBe("fresh-token");
	});

	it("shows the loading spinner while data is still loading", () => {
		localStorage.setItem(TOKEN_KEY, "seed-token");
		// Never-resolving fetch keeps the DataContext in its loading state.
		vi.mocked(fetchMembers).mockImplementation(() => new Promise(() => {}));
		vi.mocked(fetchAgenda).mockImplementation(() => new Promise(() => {}));

		renderAdmin();

		expect(screen.getByText("admin.loading")).toBeInTheDocument();
		expect(screen.queryByText("admin.login.title")).not.toBeInTheDocument();
	});

	it("shows the landing dashboard when authenticated with loaded data", async () => {
		await renderAuthed();
		expect(screen.getByText("admin.landing.title")).toBeInTheDocument();
		// All six section tiles are present.
		expect(screen.getAllByText("admin.landing.edit_button")).toHaveLength(6);
	});

	it("switches into the agenda editor and back to the landing", async () => {
		await renderAuthed();
		await gotoView("agenda", "admin.agenda.new_button");
		expect(screen.queryByText("admin.landing.title")).not.toBeInTheDocument();

		// The AdminTopBar back arrow is the first button in the editor chrome.
		fireEvent.click(screen.getAllByRole("button")[0]);
		await screen.findByText("admin.landing.title");
	});

	it("switches into the members editor and back", async () => {
		await renderAuthed();
		await gotoView("members", "admin.members.title");
		fireEvent.click(screen.getAllByRole("button")[0]);
		await screen.findByText("admin.landing.title");
	});

	it("switches into the translations editor and back", async () => {
		await renderAuthed();
		await gotoView("translations", "admin.translations.title");
		fireEvent.click(screen.getAllByRole("button")[0]);
		await screen.findByText("admin.landing.title");
	});

	it("switches into the gallery editor (lazy + own data load)", async () => {
		await renderAuthed();
		await gotoView("gallery", "admin.gallery.title");
		expect(fetchGallery).toHaveBeenCalled();
	});

	it("switches into the redirects editor (lazy + own data load)", async () => {
		await renderAuthed();
		await gotoView("redirects", "admin.redirects.title");
		expect(fetchRedirects).toHaveBeenCalled();
	});

	it("switches into the stats dashboard (lazy + own stats load)", async () => {
		await renderAuthed();
		await gotoView("dashboard", "admin.dashboard.title");
		expect(fetchStats).toHaveBeenCalled();
	});

	it("persists data locally when an editor reports a change", async () => {
		await renderAuthed();
		await gotoView("members", "admin.members.title");

		// Adding a section fires MembersEditor's onChange -> handleChange.
		fireEvent.click(screen.getByText("admin.members.new_section"));

		await waitFor(() => expect(persistData).toHaveBeenCalled());
	});

	it("saves members to the cloud and shows a success toast", async () => {
		await renderAuthed();
		await gotoView("members", "admin.members.title");

		fireEvent.click(
			screen.getByRole("button", { name: /admin\.members\.save_cloud/ }),
		);

		await waitFor(() =>
			expect(saveMembers).toHaveBeenCalledWith("seed-token", { sections: [] }),
		);
		await screen.findByText("admin.toasts.members_success");
	});

	it("saves the agenda and shows a success toast", async () => {
		await renderAuthed();
		await gotoView("agenda", "admin.agenda.new_button");

		fireEvent.click(
			screen.getByRole("button", { name: /admin\.members\.save_cloud/ }),
		);

		await waitFor(() =>
			expect(saveAgenda).toHaveBeenCalledWith("seed-token", { events: [] }),
		);
		await screen.findByText("admin.toasts.agenda_success");
	});

	it("shows a generic error toast when a save fails without AuthError", async () => {
		await renderAuthed();
		await gotoView("agenda", "admin.agenda.new_button");

		vi.mocked(saveAgenda).mockRejectedValueOnce(new Error("network down"));

		fireEvent.click(
			screen.getByRole("button", { name: /admin\.members\.save_cloud/ }),
		);

		await screen.findByText("admin.toasts.save_error");
		// A non-auth error must NOT log the user out.
		expect(screen.getByText("admin.agenda.new_button")).toBeInTheDocument();
		expect(localStorage.getItem(TOKEN_KEY)).toBe("seed-token");
	});

	it("forces re-login when a members save throws an AuthError", async () => {
		await renderAuthed();
		await gotoView("members", "admin.members.title");

		vi.mocked(saveMembers).mockRejectedValueOnce(new AuthError());

		fireEvent.click(
			screen.getByRole("button", { name: /admin\.members\.save_cloud/ }),
		);

		await screen.findByText("admin.login.title");
		expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
	});

	it("forces re-login when a translations save throws an AuthError", async () => {
		await renderAuthed();
		await gotoView("translations", "admin.translations.title");

		vi.mocked(saveTranslations).mockRejectedValueOnce(new AuthError());

		fireEvent.click(
			screen.getByRole("button", { name: /admin\.members\.save_cloud/ }),
		);

		await screen.findByText("admin.login.title");
		expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
	});

	it("saves translations to the cloud", async () => {
		await renderAuthed();
		await gotoView("translations", "admin.translations.title");

		fireEvent.click(
			screen.getByRole("button", { name: /admin\.members\.save_cloud/ }),
		);

		await waitFor(() => expect(saveTranslations).toHaveBeenCalled());
	});

	it("forces re-login when a save throws an AuthError", async () => {
		await renderAuthed();
		await gotoView("agenda", "admin.agenda.new_button");

		vi.mocked(saveAgenda).mockRejectedValueOnce(new AuthError());

		fireEvent.click(
			screen.getByRole("button", { name: /admin\.members\.save_cloud/ }),
		);

		// The expired session logs the user out back to the LoginScreen.
		await screen.findByText("admin.login.title");
		expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
	});

	it("logs out from the landing and clears the token", async () => {
		await renderAuthed();

		fireEvent.click(screen.getByText("admin.landing.logout"));

		await screen.findByText("admin.login.title");
		expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
	});
});
