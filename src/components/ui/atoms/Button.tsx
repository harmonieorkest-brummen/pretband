import type React from "react";

interface ButtonProps {
	children: React.ReactNode;
	variant?: "primary" | "secondary" | "outline" | "ghost";
	size?: "sm" | "md" | "lg" | "xl";
	href?: string;
	className?: string;
	onClick?: () => void;
	type?: "button" | "submit" | "reset";
	disabled?: boolean;
}

export function Button({
	children,
	variant = "primary",
	size = "md",
	href,
	className = "",
	onClick,
	type = "button",
	disabled = false,
}: ButtonProps) {
	const baseStyles =
		"inline-block font-display uppercase transition-all duration-300 transform active:translate-y-1 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-pret-yellow focus-visible:ring-offset-4 focus-visible:ring-offset-pret-dark disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:rotate-0 disabled:active:translate-y-0";

	const variants = {
		primary:
			"bg-pret-yellow text-pret-dark hover:-rotate-3 hover:scale-110 shadow-[0_10px_0_#b88a3a] active:shadow-none",
		secondary:
			"bg-pret-red text-white hover:rotate-2 hover:scale-110 shadow-lg hover:bg-pret-yellow hover:text-pret-dark",
		outline:
			"border-2 border-pret-yellow text-pret-yellow hover:bg-pret-yellow hover:text-pret-dark",
		ghost:
			"text-white border-b-4 border-pret-red hover:text-pret-yellow hover:border-pret-yellow",
	};

	const sizes = {
		sm: "px-4 py-2 text-sm rounded-lg",
		md: "px-6 py-2 text-sm tracking-widest rounded-xl",
		lg: "px-8 py-4 text-2xl rounded-xl",
		xl: "px-12 py-6 text-3xl font-black rounded-2xl shadow-[0_15px_0_#b88a3a]",
	};

	const combinedClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

	if (href) {
		return (
			<a href={href} className={combinedClasses} onClick={onClick}>
				{children}
			</a>
		);
	}

	return (
		<button
			type={type}
			className={combinedClasses}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</button>
	);
}
