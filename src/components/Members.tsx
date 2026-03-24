import { useTranslation } from "react-i18next";
import { siteData } from "../data/siteData";
import { Decoration } from "./ui/atoms/Decoration";
import { Heading } from "./ui/atoms/Heading";

export function Members() {
	const { t } = useTranslation();

	const sections = siteData.members.sections;

	return (
		<section id="leden" className="relative py-32">
			<div className="pointer-events-none absolute inset-0">
				<Decoration
					type="party-popper"
					color="red"
					animation="bounce"
					className="absolute top-20 right-[10%] opacity-10"
					size={100}
				/>
				<Decoration
					type="hamburger"
					color="yellow"
					animation="float"
					className="absolute bottom-40 left-[5%] opacity-10"
					size={150}
				/>
			</div>
			<div className="mx-auto max-w-7xl px-6">
				<Heading
					level={2}
					variant="yellow"
					className="mb-20 hyphens-auto break-words text-center text-6xl md:text-8xl"
				>
					{t("members.title")}
				</Heading>

				<div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
					{sections.map((section) => (
						<div
							key={section.key}
							className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xs transition-colors hover:border-pret-yellow"
						>
							<Heading
								level={3}
								variant="red"
								className="mb-4 text-2xl transition-colors group-hover:text-pret-yellow"
							>
								{t(`members.categories.${section.key}`)}
							</Heading>
							<ul className="space-y-2">
								{section.names.map((name) => (
									<li key={name} className="font-body text-white/70 text-xl">
										– {name}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
