import type { ReactNode } from "react";

interface HeadingProps {
	children: ReactNode;
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	variant?: "white" | "yellow" | "dark" | "red";
	glow?: boolean;
	animation?:
		| "wiggle"
		| "float"
		| "pulse"
		| "spin"
		| "ping"
		| "bounce"
		| "none";
	className?: string;
}

export function Heading({
	children,
	level = 2,
	variant = "white",
	glow = false,
	animation = "none",
	className = "",
}: HeadingProps) {
	const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;

	const variants = {
		white: "text-white",
		yellow: "text-pret-yellow",
		dark: "text-pret-dark",
		red: "text-pret-red",
	};

	const glows = {
		white: "",
		yellow: glow ? "text-glow-yellow" : "",
		dark: "",
		red: glow ? "text-glow-red" : "",
	};

	const animations = {
		wiggle: "animate-wiggle",
		float: "animate-float",
		pulse: "animate-pulse",
		spin: "animate-spin",
		ping: "animate-ping",
		bounce: "animate-bounce",
		none: "",
	};

	const combinedClasses = `font-display font-black uppercase leading-none ${variants[variant]} ${glows[variant as keyof typeof glows] || ""} ${animations[animation]} ${className}`;

	return <Tag className={combinedClasses}>{children}</Tag>;
}
