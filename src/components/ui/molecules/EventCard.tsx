import { Badge } from "../atoms/Badge";

interface EventCardProps {
	date: string;
	title: string;
	location: string;
	status: string;
	calendarUrl?: string;
	variant?: "yellow" | "red";
	className?: string;
}

export function EventCard({
	date,
	title,
	location,
	status,
	calendarUrl,
	variant = "yellow",
	className = "",
}: EventCardProps) {
	const variants = {
		yellow: "hover:bg-pret-yellow group",
		red: "hover:bg-pret-red group hover:rotate-1",
	};

	const textHoverColors = {
		yellow: "group-hover:text-pret-dark",
		red: "group-hover:text-white",
	};

	const subTextHoverColors = {
		yellow: "group-hover:text-pret-red",
		red: "group-hover:text-pret-yellow",
	};

	return (
		<div
			className={`relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 p-10 transition-all duration-500 ${variants[variant]} ${className}`}
		>
			<div className="relative z-10 flex flex-col items-center justify-between md:flex-row">
				<div className="mb-6 text-center md:mb-0 md:text-left">
					<Badge
						variant={variant === "yellow" ? "red" : "yellow"}
						animation="wiggle"
						size="lg"
						className="mb-4"
					>
						{date}
					</Badge>
					<h3
						className={`font-black font-display text-4xl text-white transition-colors md:text-6xl ${textHoverColors[variant]}`}
					>
						{title}
					</h3>
					<p
						className={`font-display text-2xl text-pret-yellow uppercase transition-colors ${subTextHoverColors[variant]}`}
					>
						{location}
					</p>
				</div>
				<div className="text-center md:text-right">
					{calendarUrl ? (
						<a
							href={calendarUrl}
							download={`${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`}
							className="text-white text-xl uppercase opacity-60 transition-opacity hover:opacity-100 focus:opacity-100 group-hover:opacity-100 block"
							title="Download iCal event"
						>
							{status}
						</a>
					) : (
						<span className="text-white text-xl uppercase opacity-60 group-hover:opacity-100">
							{status}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
