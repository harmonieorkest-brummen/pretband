import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

// Brand-coloured, high-contrast modules on a white quiet zone so the code
// stays scannable when printed.
const QR_OPTIONS = {
	margin: 2,
	color: { dark: "#2A2324", light: "#ffffff" },
} as const;

interface QrCodeProps {
	/** The exact string encoded in the QR code (usually the redirect URL). */
	value: string;
	size?: number;
	className?: string;
}

/** Renders a QR code to a canvas and re-renders whenever `value` changes. */
export function QrCode({ value, size = 160, className = "" }: QrCodeProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		let cancelled = false;
		QRCode.toCanvas(canvas, value, { ...QR_OPTIONS, width: size })
			.then(() => {
				if (!cancelled) setFailed(false);
			})
			.catch(() => {
				if (!cancelled) setFailed(true);
			});
		return () => {
			cancelled = true;
		};
	}, [value, size]);

	if (failed) {
		return (
			<div
				className="flex items-center justify-center rounded-xl bg-white/10 text-center text-white/40 text-xs"
				style={{ width: size, height: size }}
			>
				—
			</div>
		);
	}

	return (
		<canvas
			ref={canvasRef}
			width={size}
			height={size}
			className={`rounded-xl bg-white ${className}`}
		/>
	);
}

function triggerDownload(href: string, filename: string) {
	const link = document.createElement("a");
	link.href = href;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

/** Downloads the QR code as a high-resolution PNG. */
export async function downloadQrPng(value: string, filename: string) {
	const dataUrl = await QRCode.toDataURL(value, { ...QR_OPTIONS, width: 1024 });
	triggerDownload(dataUrl, `${filename}.png`);
}

/** Downloads the QR code as an infinitely-scalable SVG (best for print). */
export async function downloadQrSvg(value: string, filename: string) {
	const svg = await QRCode.toString(value, { ...QR_OPTIONS, type: "svg" });
	const blob = new Blob([svg], { type: "image/svg+xml" });
	const url = URL.createObjectURL(blob);
	try {
		triggerDownload(url, `${filename}.svg`);
	} finally {
		URL.revokeObjectURL(url);
	}
}
