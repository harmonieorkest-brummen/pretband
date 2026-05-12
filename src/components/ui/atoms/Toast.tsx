import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
	message: string;
	type?: ToastType;
	onClose: () => void;
	duration?: number;
}

export function Toast({
	message,
	type = "success",
	onClose,
	duration = 3000,
}: ToastProps) {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setVisible(false);
			setTimeout(onClose, 300); // Wait for exit animation
		}, duration);
		return () => clearTimeout(timer);
	}, [duration, onClose]);

	const bgClass =
		type === "success"
			? "bg-pret-yellow text-black"
			: type === "error"
				? "bg-pret-red text-white"
				: "bg-white/10 text-white backdrop-blur-md";

	return (
		<div
			className={`fixed top-8 right-8 z-[100] transform transition-all duration-300 ${visible ? "translate-y-0 scale-100 opacity-100" : "-translate-y-4 scale-95 opacity-0"}`}
		>
			<div
				className={`${bgClass} flex items-center gap-4 rounded-2xl border border-white/10 px-6 py-4 font-bold font-display text-sm uppercase tracking-wider shadow-2xl`}
			>
				<span className="text-xl">
					{type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}
				</span>
				{message}
			</div>
		</div>
	);
}
