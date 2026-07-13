import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataProvider, useData } from "@/context/DataContext";
import { ToastProvider, useToast } from "@/context/ToastContext";
import { fetchAgenda, fetchMembers } from "@/utils/adminData";

vi.mock("@/utils/adminData", () => ({
	fetchMembers: vi.fn(),
	fetchAgenda: vi.fn(),
}));

const mockFetchMembers = vi.mocked(fetchMembers);
const mockFetchAgenda = vi.mocked(fetchAgenda);

const membersFixture: Members = { sections: [] };
const agendaFixture: Agenda = { events: [] };

afterEach(() => {
	vi.clearAllMocks();
});

describe("ToastContext", () => {
	function ToastConsumer() {
		const { showToast } = useToast();
		return (
			<div>
				<button type="button" onClick={() => showToast("Saved!")}>
					default
				</button>
				<button type="button" onClick={() => showToast("Boom", "error")}>
					error
				</button>
			</div>
		);
	}

	it("throws when useToast is used outside the provider", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => render(<ToastConsumer />)).toThrow(
			"useToast must be used within ToastProvider",
		);
		spy.mockRestore();
	});

	it("provides showToast and renders a toast with the default success type", () => {
		render(
			<ToastProvider>
				<ToastConsumer />
			</ToastProvider>,
		);

		expect(screen.queryByText("Saved!")).not.toBeInTheDocument();

		fireEvent.click(screen.getByText("default"));

		const toast = screen.getByText("Saved!");
		expect(toast).toBeInTheDocument();
		// success uses the yellow background + checkmark glyph
		expect(screen.getByText("✓")).toBeInTheDocument();
	});

	it("renders an error toast when a type is passed", () => {
		render(
			<ToastProvider>
				<ToastConsumer />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByText("error"));

		expect(screen.getByText("Boom")).toBeInTheDocument();
		expect(screen.getByText("✕")).toBeInTheDocument();
	});

	it("stacks multiple toasts", () => {
		render(
			<ToastProvider>
				<ToastConsumer />
			</ToastProvider>,
		);

		fireEvent.click(screen.getByText("default"));
		fireEvent.click(screen.getByText("error"));

		expect(screen.getByText("Saved!")).toBeInTheDocument();
		expect(screen.getByText("Boom")).toBeInTheDocument();
	});

	it("auto-removes a toast after its duration elapses", async () => {
		vi.useFakeTimers();
		try {
			render(
				<ToastProvider>
					<ToastConsumer />
				</ToastProvider>,
			);

			fireEvent.click(screen.getByText("default"));
			expect(screen.getByText("Saved!")).toBeInTheDocument();

			// Toast hides after 3000ms, then calls onClose 300ms later
			act(() => {
				vi.advanceTimersByTime(3000);
				vi.advanceTimersByTime(300);
			});

			expect(screen.queryByText("Saved!")).not.toBeInTheDocument();
		} finally {
			vi.useRealTimers();
		}
	});
});

describe("DataContext", () => {
	beforeEach(() => {
		mockFetchMembers.mockResolvedValue(membersFixture);
		mockFetchAgenda.mockResolvedValue(agendaFixture);
	});

	function DataConsumer() {
		const { data, loading, error, refetch } = useData();
		return (
			<div>
				<span data-testid="loading">{loading ? "loading" : "idle"}</span>
				<span data-testid="error">{error ? error.message : "none"}</span>
				<span data-testid="sections">
					{data ? String(data.members.sections.length) : "no-data"}
				</span>
				<button type="button" onClick={() => refetch()}>
					refetch
				</button>
			</div>
		);
	}

	it("throws when useData is used outside the provider", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => render(<DataConsumer />)).toThrow(
			"useData must be used within a DataProvider",
		);
		spy.mockRestore();
	});

	it("fetches members and agenda on mount and exposes the data", async () => {
		render(
			<DataProvider>
				<DataConsumer />
			</DataProvider>,
		);

		await waitFor(() =>
			expect(screen.getByTestId("loading")).toHaveTextContent("idle"),
		);

		expect(mockFetchMembers).toHaveBeenCalledTimes(1);
		expect(mockFetchAgenda).toHaveBeenCalledTimes(1);
		expect(screen.getByTestId("error")).toHaveTextContent("none");
		expect(screen.getByTestId("sections")).toHaveTextContent("0");
	});

	it("captures an Error thrown by the data layer", async () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		mockFetchMembers.mockRejectedValueOnce(new Error("network down"));

		render(
			<DataProvider>
				<DataConsumer />
			</DataProvider>,
		);

		await waitFor(() =>
			expect(screen.getByTestId("loading")).toHaveTextContent("idle"),
		);

		expect(screen.getByTestId("error")).toHaveTextContent("network down");
		expect(screen.getByTestId("sections")).toHaveTextContent("no-data");
		spy.mockRestore();
	});

	it("wraps a non-Error rejection in an Error", async () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		mockFetchAgenda.mockRejectedValueOnce("just a string");

		render(
			<DataProvider>
				<DataConsumer />
			</DataProvider>,
		);

		await waitFor(() =>
			expect(screen.getByTestId("loading")).toHaveTextContent("idle"),
		);

		expect(screen.getByTestId("error")).toHaveTextContent("Unknown error");
		spy.mockRestore();
	});

	it("refetch re-runs the fetch and clears a previous error", async () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		mockFetchMembers.mockRejectedValueOnce(new Error("first fail"));

		render(
			<DataProvider>
				<DataConsumer />
			</DataProvider>,
		);

		await waitFor(() =>
			expect(screen.getByTestId("error")).toHaveTextContent("first fail"),
		);

		fireEvent.click(screen.getByText("refetch"));

		await waitFor(() =>
			expect(screen.getByTestId("error")).toHaveTextContent("none"),
		);
		expect(screen.getByTestId("sections")).toHaveTextContent("0");
		expect(mockFetchMembers).toHaveBeenCalledTimes(2);
		spy.mockRestore();
	});
});
