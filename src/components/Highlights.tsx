import { useTranslation } from "react-i18next";
import { Decoration } from "./ui/atoms/Decoration";
import { Heading } from "./ui/atoms/Heading";

export function Highlights() {
	const { t } = useTranslation();

	return (
		<section id="highlights" className="relative z-10 py-32 overflow-hidden">
			<div className="pointer-events-none absolute inset-0">
				<Decoration
					type="party-popper"
					color="red"
					animation="bounce"
					className="absolute top-20 left-[10%] opacity-10"
					size={100}
				/>
				<Decoration
					type="star"
					color="yellow"
					animation="float"
					className="absolute bottom-40 right-[5%] opacity-10"
					size={150}
				/>
			</div>
			
			<div className="mx-auto max-w-7xl px-6">
				<div className="text-center mb-16">
					<Heading
						level={2}
						variant="yellow"
						className="mb-6 text-6xl md:text-8xl"
					>
						{t("highlights.title")}
					</Heading>
					<p className="mx-auto max-w-2xl font-body text-2xl text-white/70">
						{t("highlights.description")}
					</p>
				</div>

				<div className="relative group">
					{/* Video Wrapper with decorative border */}
					<div className="relative z-10 aspect-video w-full overflow-hidden rounded-[2rem] border-4 border-white/10 bg-pret-dark shadow-2xl transition-transform duration-500 group-hover:scale-[1.01] md:rounded-[4rem] md:border-8">
						<iframe
							src="https://www.youtube.com/embed/98VH-CuOSvI"
							title={t("highlights.watch_video")}
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowFullScreen
							className="h-full w-full border-0"
						></iframe>
					</div>
					
					{/* Decorative background glow */}
					<div className="absolute -inset-4 z-0 bg-pret-yellow/20 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
				</div>
			</div>
		</section>
	);
}
