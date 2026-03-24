import {
	Cherry,
	Hamburger,
	Heart,
	Music,
	PartyPopper,
	Plus,
	Stars,
	Triangle,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { useEasterEggs } from "../../../context/EasterEggContext";

const STAR_PATH = "M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z";

export type DecorationType =
	| "star"
	| "circle"
	| "triangle"
	| "plus"
	| "party-popper"
	| "hamburger"
	| "zap"
	| "heart"
	| "cherry"
	| "stars"
	| "trumpet";

interface DecorationProps {
	type: DecorationType;
	color?: "red" | "yellow" | "white" | "dark";
	animation?:
		| "float"
		| "wiggle"
		| "pulse"
		| "spin"
		| "ping"
		| "bounce"
		| "none";
	size?: number;
	className?: string;
	opacity?: number;
	isEasterEgg?: boolean;
	eggId?: "doot" | "rainbow-star" | "bouncing-pret" | "confetti-rain";
	onFound?: () => void;
}

export function Decoration({
	type,
	color = "yellow",
	animation = "none",
	size = 100,
	className = "",
	opacity = 0.2,
	isEasterEgg = false,
	eggId,
	onFound,
}: DecorationProps) {
	const colors = {
		red: "text-pret-red",
		yellow: "text-pret-yellow",
		white: "text-white",
		dark: "text-pret-dark",
	};

	const animations = {
		float: "animate-float",
		wiggle: "animate-wiggle",
		pulse: "animate-pulse",
		spin: "animate-spin",
		ping: "animate-ping",
		bounce: "animate-bounce",
		none: "",
	};

	const combinedClasses = `${colors[color]} ${animations[animation]} transition-all will-change-transform ${className}`;
	const style = { opacity };

	const renderIcon = () => {
		switch (type) {
			// CUSTOM SVG (Kept as per user request)
			case "star":
				return (
					<svg
						width={size}
						height={size}
						viewBox="0 0 100 100"
						className="fill-current"
					>
						<title>Star</title>
						<path d={STAR_PATH} />
					</svg>
				);
			case "circle":
				return (
					<svg width={size} height={size} viewBox="0 0 100 100">
						<title>Circle</title>
						<circle
							cx="50"
							cy="50"
							r="40"
							stroke="currentColor"
							strokeWidth="8"
							fill="none"
							strokeDasharray="20 10"
						/>
					</svg>
				);

			// LUCIDE ICONS
			// Keep icons "dumb": color and animation come from the wrapper via currentColor + Tailwind classes.
			case "party-popper":
				return (
					<PartyPopper size={size} strokeWidth={2.5} className="fill-current" />
				);
			case "hamburger":
				return <Hamburger size={size} strokeWidth={2.5} />;
			case "triangle":
				return (
					<Triangle size={size} strokeWidth={2.5} className="fill-current" />
				);
			case "plus":
				return <Plus size={size} strokeWidth={4} />;
			case "zap":
				return <Zap size={size} strokeWidth={2.5} className="fill-current" />;
			case "heart":
				return <Heart size={size} strokeWidth={2.5} className="fill-current" />;
			case "cherry":
				return <Cherry size={size} strokeWidth={2.5} />;
			case "stars":
				return <Stars size={size} strokeWidth={2.5} className="fill-current" />;
			case "trumpet":
				return <Music size={size} strokeWidth={2.5} />;
			default:
				return null;
		}
	};

	const { findEgg, foundEggs } = useEasterEggs();
	const [isClicked, setIsClicked] = useState(false);

	const isAlreadyFound = eggId && foundEggs.includes(eggId);

	const handleClick = () => {
		if (isEasterEgg && eggId) {
			setIsClicked(true);
			findEgg(eggId);
			onFound?.();
			setTimeout(() => setIsClicked(false), 1000);
		}
	};

	const eggClasses = isEasterEgg
		? `cursor-pointer pointer-events-auto hover:scale-125 hover:opacity-100 ${
				isClicked ? "animate-bounce scale-150 opacity-100" : ""
			} ${isAlreadyFound ? "opacity-60 grayscale-[0.5]" : ""}`
		: "pointer-events-none";

	return (
		<div
			className={`${combinedClasses} ${eggClasses}`}
			style={style}
			aria-hidden={!isEasterEgg}
			onClick={handleClick}
			data-testid="decoration"
		>
			{renderIcon()}
		</div>
	);
}
