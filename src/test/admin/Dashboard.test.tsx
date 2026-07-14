import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dashboard } from "@/pages/admin/views/Dashboard";

const { fetchStats } = vi.hoisted(() => ({ fetchStats: vi.fn() }));
const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));
// A STABLE t (identity preserved across renders) — like real react-i18next —
// so the load callback isn't recreated every render and the effect runs once.
const { t } = vi.hoisted(() => ({ t: (key: string) => key }));

vi.mock("react-i18next", () => ({
	useTranslation: () => ({ t }),
}));

vi.mock("@/context/ToastContext", () => ({
	useToast: () => ({ showToast }),
}));

vi.mock("@/utils/adminData", () => {
	class AuthError extends Error {
		constructor(message = "Unauthorized") {
			super(message);
			this.name = "AuthError";
		}
	}
	return { AuthError, fetchStats };
});

import { AuthError } from "@/utils/adminData";

const TOKEN_KEY = "band_admin_token";

const baseStats = {
	qr: {
		totalScans: 55,
		topCode: { slug: "poster", label: "Poster", url: "https://x", scans: 40 },
		codes: [
			{ slug: "poster", label: "Poster", url: "https://x", scans: 40 },
			{ slug: "flyer", label: "", url: "https://y", scans: 15 },
		],
	},
	confetti: { bursts: 842 },
	contact: { submissions: 37 },
	security: { failedLogins24h: 2, lastLogin: "2026-07-14T09:00:00.000Z" },
	traffic: { connected: false, reason: "not_configured" },
};

function renderDashboard() {
	const onBack = vi.fn();
	const onLogout = vi.fn();
	const utils = render(<Dashboard onBack={onBack} onLogout={onLogout} />);
	return { onBack, onLogout, ...utils };
}

beforeEach(() => {
	localStorage.setItem(TOKEN_KEY, "tok");
	fetchStats.mockReset();
	showToast.mockReset();
});

afterEach(() => {
	vi.clearAllMocks();
	localStorage.clear();
});

describe("Dashboard", () => {
	it("shows a spinner while stats are loading", () => {
		fetchStats.mockImplementation(() => new Promise(() => {}));
		const { container } = renderDashboard();
		expect(container.querySelector(".animate-spin")).toBeInTheDocument();
		expect(
			screen.queryByText("admin.dashboard.confetti"),
		).not.toBeInTheDocument();
	});

	it("logs out and never fetches when there is no token", () => {
		localStorage.removeItem(TOKEN_KEY);
		const { onLogout } = renderDashboard();
		expect(onLogout).toHaveBeenCalledTimes(1);
		expect(fetchStats).not.toHaveBeenCalled();
	});

	it("renders every stat card after a successful load", async () => {
		fetchStats.mockResolvedValue(baseStats);
		renderDashboard();

		await screen.findByText("admin.dashboard.confetti");
		// Counters.
		expect(screen.getByText("842")).toBeInTheDocument(); // confetti bursts
		expect(screen.getByText("37")).toBeInTheDocument(); // contact submissions
		expect(screen.getByText("2")).toBeInTheDocument(); // failed logins 24h
		// QR totals + top code + per-code row.
		expect(screen.getByText("55")).toBeInTheDocument();
		// "Poster" appears twice: as the top code and in the per-code list.
		expect(screen.getAllByText("Poster").length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText("/flyer")).toBeInTheDocument();
		// Traffic is not connected → shows the hint, not numbers.
		expect(
			screen.getByText("admin.dashboard.traffic_disconnected"),
		).toBeInTheDocument();
	});

	it("shows visitor and page-view numbers when traffic is connected", async () => {
		fetchStats.mockResolvedValue({
			...baseStats,
			traffic: {
				connected: true,
				rangeDays: 28,
				activeUsers: 120,
				pageViews: 456,
			},
		});
		renderDashboard();

		await screen.findByText("admin.dashboard.visitors");
		expect(screen.getByText("120")).toBeInTheDocument();
		expect(screen.getByText("456")).toBeInTheDocument();
	});

	it("shows an empty-state message when there are no QR codes", async () => {
		fetchStats.mockResolvedValue({
			...baseStats,
			qr: { totalScans: 0, topCode: null, codes: [] },
		});
		renderDashboard();
		await screen.findByText("admin.dashboard.qr_empty");
	});

	it("shows a 'never' hint when there is no last login", async () => {
		fetchStats.mockResolvedValue({
			...baseStats,
			security: { failedLogins24h: 0, lastLogin: null },
		});
		renderDashboard();
		await screen.findByText("admin.dashboard.security_never", { exact: false });
	});

	it("logs out when the stats request throws an AuthError", async () => {
		fetchStats.mockRejectedValue(new AuthError());
		const { onLogout } = renderDashboard();
		await waitFor(() => expect(onLogout).toHaveBeenCalledTimes(1));
		expect(showToast).not.toHaveBeenCalled();
	});

	it("shows an error toast on a non-auth failure", async () => {
		fetchStats.mockRejectedValue(new Error("boom"));
		const { onLogout } = renderDashboard();
		await waitFor(() =>
			expect(showToast).toHaveBeenCalledWith(
				"admin.dashboard.load_error",
				"error",
			),
		);
		expect(onLogout).not.toHaveBeenCalled();
	});

	it("re-fetches when the refresh button is clicked", async () => {
		fetchStats.mockResolvedValue(baseStats);
		renderDashboard();
		await screen.findByText("admin.dashboard.confetti");
		expect(fetchStats).toHaveBeenCalledTimes(1);

		fireEvent.click(
			screen
				.getByText("admin.dashboard.refresh")
				.closest("button") as HTMLElement,
		);
		await waitFor(() => expect(fetchStats).toHaveBeenCalledTimes(2));
	});

	it("invokes onBack from the top bar back button", async () => {
		fetchStats.mockResolvedValue(baseStats);
		const { onBack } = renderDashboard();
		await screen.findByText("admin.dashboard.confetti");
		// Back arrow is the first button in the top bar.
		fireEvent.click(screen.getAllByRole("button")[0]);
		expect(onBack).toHaveBeenCalledTimes(1);
	});
});
