import type React from "react";

interface BadgeProps {
	children: React.ReactNode;
	variant?: "red" | "yellow" | "dark";
	size?: "sm" | "md" | "lg" | "xl";
	animation?: "bounce" | "wiggle" | "pulse" | "spin" | "ping" | "none";
	className?: string;
}

export function Badge({
	children,
	variant = "red",
	size = "md",
	animation = "none",
	className = "",
}: BadgeProps) {
	const baseStyles =
		"inline-flex items-center justify-center font-display uppercase font-black";

	const variants = {
		red: "bg-pret-red text-white",
		yellow: "bg-pret-yellow text-pret-dark",
		dark: "bg-pret-dark text-white",
	};

	const sizes = {
		sm: "px-3 py-1 text-sm rounded-lg",
		md: "px-4 py-2 text-xl rounded-full",
		lg: "px-6 py-3 text-2xl rounded-2xl",
		xl: "w-32 h-32 text-4xl rounded-full text-center",
	};

	const animations = {
		bounce: "animate-bounce",
		wiggle: "animate-wiggle",
		pulse: "animate-pulse",
		spin: "animate-spin",
		ping: "animate-ping",
		none: "",
	};

	const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${animations[animation]} ${className}`;

	return <div className={combinedClasses}>{children}</div>;
}
