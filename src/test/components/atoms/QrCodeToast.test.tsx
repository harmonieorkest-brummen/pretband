import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	downloadQrPng,
	downloadQrSvg,
	QrCode,
} from "@/components/ui/atoms/QrCode";
import { Toast } from "@/components/ui/atoms/Toast";

const toCanvas = vi.fn(async (..._args: unknown[]) => undefined);
const toDataURL = vi.fn(
	async (..._args: unknown[]) => "data:image/png;base64,x",
);
const toSvg = vi.fn(async (..._args: unknown[]) => "<svg>qr</svg>");

vi.mock("qrcode", () => ({
	default: {
		toCanvas: (...args: unknown[]) => toCanvas(...args),
		toDataURL: (...args: unknown[]) => toDataURL(...args),
		toString: (...args: unknown[]) => toSvg(...args),
	},
}));

describe("QrCode", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("renders a canvas and encodes the given value at the default size", async () => {
		const { container } = render(<QrCode value="https://pret.band/x" />);

		const canvas = container.querySelector("canvas");
		expect(canvas).toBeInTheDocument();
		expect(canvas).toHaveAttribute("width", "160");
		expect(canvas).toHaveAttribute("height", "160");
		expect(canvas?.className).toContain("bg-white");

		await waitFor(() => expect(toCanvas).toHaveBeenCalledTimes(1));
		const [canvasArg, valueArg, opts] = toCanvas.mock.calls[0] as [
			HTMLCanvasElement,
			string,
			{ width: number },
		];
		expect(canvasArg).toBe(canvas);
		expect(valueArg).toBe("https://pret.band/x");
		expect(opts.width).toBe(160);
	});

	it("honours the size and className props", async () => {
		const { container } = render(
			<QrCode value="v" size={240} className="my-extra" />,
		);

		const canvas = container.querySelector("canvas");
		expect(canvas).toHaveAttribute("width", "240");
		expect(canvas?.className).toContain("my-extra");

		await waitFor(() => expect(toCanvas).toHaveBeenCalled());
		const opts = toCanvas.mock.calls[0][2] as { width: number };
		expect(opts.width).toBe(240);
	});

	it("re-renders the canvas when the value changes", async () => {
		const { rerender } = render(<QrCode value="first" />);
		await waitFor(() => expect(toCanvas).toHaveBeenCalledTimes(1));

		rerender(<QrCode value="second" />);
		await waitFor(() => expect(toCanvas).toHaveBeenCalledTimes(2));
		expect(toCanvas.mock.calls[1][1]).toBe("second");
	});

	it("shows a placeholder when QR generation fails", async () => {
		toCanvas.mockRejectedValueOnce(new Error("boom"));
		const { container } = render(<QrCode value="bad" size={120} />);

		const placeholder = await screen.findByText("—");
		expect(placeholder).toBeInTheDocument();
		expect(placeholder).toHaveStyle({ width: "120px", height: "120px" });
		expect(container.querySelector("canvas")).not.toBeInTheDocument();
	});
});

describe("downloadQrPng / downloadQrSvg", () => {
	let clickSpy: ReturnType<typeof vi.spyOn>;
	let createObjectURL: ReturnType<typeof vi.fn>;
	let revokeObjectURL: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		clickSpy = vi
			.spyOn(HTMLAnchorElement.prototype, "click")
			.mockImplementation(() => undefined);
		createObjectURL = vi.fn(() => "blob:mock-url");
		revokeObjectURL = vi.fn();
		vi.stubGlobal("URL", {
			...URL,
			createObjectURL,
			revokeObjectURL,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it("downloads a PNG built from the data URL", async () => {
		await downloadQrPng("https://pret.band/y", "event-qr");

		expect(toDataURL).toHaveBeenCalledTimes(1);
		const [value, opts] = toDataURL.mock.calls[0] as [
			string,
			{ width: number },
		];
		expect(value).toBe("https://pret.band/y");
		expect(opts.width).toBe(1024);
		expect(clickSpy).toHaveBeenCalledTimes(1);
		// Anchor is cleaned up after the click.
		expect(document.querySelector("a[download]")).toBeNull();
	});

	it("downloads an SVG blob and revokes the object URL", async () => {
		await downloadQrSvg("https://pret.band/z", "event-qr");

		expect(toSvg).toHaveBeenCalledTimes(1);
		const opts = toSvg.mock.calls[0][1] as { type: string };
		expect(opts.type).toBe("svg");
		expect(createObjectURL).toHaveBeenCalledTimes(1);
		expect(clickSpy).toHaveBeenCalledTimes(1);
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
	});
});

describe("Toast", () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it("renders the message with the success icon and styling by default", () => {
		render(<Toast message="Saved!" onClose={vi.fn()} />);

		expect(screen.getByText("Saved!")).toBeInTheDocument();
		expect(screen.getByText("✓")).toBeInTheDocument();
	});

	it("renders the error variant", () => {
		const { container } = render(
			<Toast message="Nope" type="error" onClose={vi.fn()} />,
		);

		expect(screen.getByText("✕")).toBeInTheDocument();
		expect(container.querySelector(".bg-pret-red")).toBeInTheDocument();
	});

	it("renders the info variant", () => {
		const { container } = render(
			<Toast message="Heads up" type="info" onClose={vi.fn()} />,
		);

		expect(screen.getByText("ℹ")).toBeInTheDocument();
		expect(container.querySelector(".backdrop-blur-md")).toBeInTheDocument();
	});

	it("auto-dismisses and calls onClose after the duration plus exit animation", () => {
		vi.useFakeTimers();
		const onClose = vi.fn();
		render(<Toast message="bye" onClose={onClose} duration={1000} />);

		expect(onClose).not.toHaveBeenCalled();

		// Duration elapses: starts the exit animation but not yet closed.
		vi.advanceTimersByTime(1000);
		expect(onClose).not.toHaveBeenCalled();

		// Exit animation (300ms) elapses: onClose fires.
		vi.advanceTimersByTime(300);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("clears the timer on unmount so onClose is not called", () => {
		vi.useFakeTimers();
		const onClose = vi.fn();
		const { unmount } = render(
			<Toast message="temp" onClose={onClose} duration={500} />,
		);

		unmount();
		vi.advanceTimersByTime(1000);
		expect(onClose).not.toHaveBeenCalled();
	});
});
