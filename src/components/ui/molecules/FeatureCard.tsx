import { Heading } from "../atoms/Heading";

interface FeatureCardProps {
	title: string;
	description: string;
	variant?: "glass" | "dark";
	className?: string;
}

export function FeatureCard({
	title,
	description,
	variant = "glass",
	className = "",
}: FeatureCardProps) {
	const variants = {
		glass:
			"bg-white/10 backdrop-blur-md border border-white/20 hover:-translate-y-2",
		dark: "bg-pret-dark rotate-2 hover:rotate-0",
	};

	return (
		<div
			className={`transform rounded-3xl p-8 transition-all ${variants[variant]} ${className}`}
		>
			<Heading
				level={3}
				variant={variant === "glass" ? "yellow" : "red"}
				className="mb-4 block text-5xl"
			>
				{title}
			</Heading>
			<p className="text-lg text-white">{description}</p>
		</div>
	);
}
