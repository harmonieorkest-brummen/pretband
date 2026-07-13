import { renderHook, waitFor } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnalyticsProvider } from "@/analytics/AnalyticsContext";
import { useBasinAhoy } from "@/analytics/useBasinAhoy";

// The dynamic `import("ahoy.js")` inside the hook resolves to this mock and,
// crucially, does NOT attach `window.ahoy` — so each test controls the shape
// of `window.ahoy` explicitly.
vi.mock("ahoy.js", () => ({ default: {} }));

function wrapper({ children }: { children: React.ReactNode }) {
	return <AnalyticsProvider>{children}</AnalyticsProvider>;
}

function makeAhoyApi() {
	return {
		configure: vi.fn(),
		start: vi.fn(),
		trackView: vi.fn(),
		trackSubmits: vi.fn(),
		track: vi.fn(),
	};
}

afterEach(() => {
	delete window.ahoy;
	vi.clearAllMocks();
});

describe("useBasinAhoy (coverage)", () => {
	it("does not load or configure ahoy when disabled", async () => {
		const { result } = renderHook(() => useBasinAhoy("contact", false), {
			wrapper,
		});
		expect(result.current).toBeUndefined();
		// The `enabled` guard returns early before any window.ahoy default is set.
		expect(window.ahoy).toBeUndefined();
	});

	it("configures endpoints, starts and tracks a view when enabled", async () => {
		const api = makeAhoyApi();
		window.ahoy = api;

		renderHook(() => useBasinAhoy("contact-form", true), { wrapper });

		await waitFor(() => expect(api.configure).toHaveBeenCalledTimes(1));
		expect(api.configure).toHaveBeenCalledWith({
			visitsUrl: "https://usebasin.com/ahoy/visits",
			eventsUrl: "https://usebasin.com/ahoy/events",
			page: "contact-form",
			startOnReady: false,
		});
		expect(api.start).toHaveBeenCalledTimes(1);
		expect(api.trackView).toHaveBeenCalledTimes(1);
	});

	it("still tracks a view when start() is not present on the api", async () => {
		const api = makeAhoyApi();
		// Simulate a build of ahoy.js that exposes trackView but not start.
		const { start, ...noStart } = api;
		window.ahoy = noStart as typeof api;

		renderHook(() => useBasinAhoy("no-start", true), { wrapper });

		await waitFor(() => expect(api.trackView).toHaveBeenCalledTimes(1));
		expect(api.configure).toHaveBeenCalledTimes(1);
	});

	it("skips configuration when window.ahoy lacks a configure() method", async () => {
		// Pre-seed a config-only defaults object (no `configure` key). Line 47's
		// `?? ` keeps it, and configureAhoy bails at the `"configure" in` guard.
		const configOnly: AhoyConfig = { startOnReady: false };
		window.ahoy = configOnly;

		renderHook(() => useBasinAhoy("cfg-only", true), { wrapper });

		// Let the async run() settle; nothing should throw and no API is present.
		await waitFor(() => {
			expect(window.ahoy).toBeDefined();
		});
		await Promise.resolve();
		expect("trackView" in (window.ahoy ?? {})).toBe(false);
	});

	it("reconfigures with the new page when formId changes after ready", async () => {
		const api = makeAhoyApi();
		window.ahoy = api;

		const { rerender } = renderHook(
			({ id }: { id: string }) => useBasinAhoy(id, true),
			{ wrapper, initialProps: { id: "form-a" } },
		);

		await waitFor(() =>
			expect(api.configure).toHaveBeenCalledWith(
				expect.objectContaining({ page: "form-a" }),
			),
		);
		api.configure.mockClear();
		api.trackView.mockClear();

		rerender({ id: "form-b" });

		await waitFor(() =>
			expect(api.configure).toHaveBeenCalledWith(
				expect.objectContaining({ page: "form-b" }),
			),
		);
		// The reconfigure path re-runs configureAhoy, which also re-tracks a view.
		expect(api.trackView).toHaveBeenCalled();
	});

	it("does not reconfigure when the formId is unchanged after ready", async () => {
		const api = makeAhoyApi();
		window.ahoy = api;

		const { rerender } = renderHook(
			({ id }: { id: string }) => useBasinAhoy(id, true),
			{ wrapper, initialProps: { id: "stable" } },
		);

		await waitFor(() => expect(api.configure).toHaveBeenCalledTimes(1));
		api.configure.mockClear();

		rerender({ id: "stable" });
		// Give any pending effect a chance to fire.
		await Promise.resolve();
		await Promise.resolve();

		expect(api.configure).not.toHaveBeenCalled();
	});

	it("becomes enabled after mounting disabled without loading twice", async () => {
		const api = makeAhoyApi();
		window.ahoy = api;

		const { rerender } = renderHook(
			({ on }: { on: boolean }) => useBasinAhoy("late", on),
			{ wrapper, initialProps: { on: false } },
		);

		// Disabled: nothing happened yet.
		expect(api.configure).not.toHaveBeenCalled();

		rerender({ on: true });

		await waitFor(() => expect(api.configure).toHaveBeenCalledTimes(1));
		expect(api.trackView).toHaveBeenCalledTimes(1);
	});
});
