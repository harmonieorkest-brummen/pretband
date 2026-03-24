import { useTranslation } from "react-i18next";
import pretbandImg from "../assets/images/pretband.png";
import { Decoration } from "./ui/atoms/Decoration";
import { Heading } from "./ui/atoms/Heading";
import { FeatureCard } from "./ui/molecules/FeatureCard";

export function About() {
	const { t } = useTranslation();

	return (
		<section id="wie" className="relative py-40">
			<div className="pointer-events-none absolute inset-0">
				<Decoration
					type="star"
					color="yellow"
					animation="float"
					className="absolute bottom-20 left-[5%] opacity-10"
					size={150}
				/>
				<Decoration
					type="cherry"
					color="red"
					animation="pulse"
					className="absolute top-1/2 right-[10%] opacity-5"
					size={200}
				/>
				<Decoration
					type="star"
					color="yellow"
					animation="spin"
					className="absolute top-10 left-[20%]"
					size={40}
					isEasterEgg
					eggId="rainbow-star"
				/>
			</div>
			<div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
				<div className="group relative">
					<div className="aspect-square w-full -rotate-6 overflow-hidden rounded-[4rem] border-8 border-pret-yellow bg-pret-dark shadow-2xl transition-transform duration-500 group-hover:rotate-0">
						<img
							src={pretbandImg}
							alt="The Band"
							width="600"
							height="600"
							className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
						/>
					</div>
				</div>
				<div className="text-white">
					<Heading
						level={2}
						className="mb-10 text-6xl leading-[0.8] drop-shadow-xl md:text-9xl"
					>
						{t("about.title_1")} <br />
						<span className="animate-lamp-flicker text-pret-yellow italic">
							{t("about.title_2")}
						</span>
					</Heading>
					<p className="mb-8 font-body text-md leading-relaxed md:text-3xl">
						{t("about.description")}
					</p>
					<div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
						<FeatureCard
							title={t("about.feat_1_title")}
							description={t("about.feat_1_desc")}
							variant="glass"
						/>
						<FeatureCard
							title={t("about.feat_2_title")}
							description={t("about.feat_2_desc")}
							variant="dark"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
