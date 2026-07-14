import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/atoms/Button";
import { Heading } from "@/components/ui/atoms/Heading";
import en from "@/locales/en.json";

interface LandingScreenProps {
	data: SiteData;
	onSelect: (view: string) => void;
	onLogout: () => void;
}

export function LandingScreen({
	data,
	onSelect,
	onLogout,
}: LandingScreenProps) {
	const { t } = useTranslation();
	const totalMembers = data.members.sections.reduce(
		(a: number, s: MembersSection) => a + s.names.length,
		0,
	);

	return (
		<div className="mx-auto min-h-screen max-w-6xl px-6 py-20">
			<div className="mb-16 flex animate-fade-in flex-col items-start justify-between gap-6 md:flex-row md:items-center">
				<div>
					<Heading level={2} variant="yellow" className="text-5xl md:text-6xl">
						{t("admin.landing.title")}
					</Heading>
					<p className="mt-2 text-white/60 text-xs uppercase tracking-[2.5px]">
						{t("admin.landing.subtitle")}
					</p>
				</div>
				<div className="flex flex-wrap gap-4">
					<Button variant="secondary" onClick={onLogout} size="sm">
						{t("admin.landing.logout")}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{[
					{
						key: "dashboard",
						icon: "📊",
						title: t("admin.landing.dashboard_title", "STATISTIEKEN"),
						stat: t("admin.landing.dashboard_stat", "BEKIJK CIJFERS"),
						desc: t(
							"admin.landing.dashboard_desc",
							"Bekijk QR-scans, confetti, contactberichten en verkeer.",
						),
					},
					{
						key: "agenda",
						icon: "📅",
						title: t("admin.landing.agenda_title"),
						stat: t("admin.landing.agenda_stat", {
							count: data.agenda.events.length,
						}),
						desc: t("admin.landing.agenda_desc"),
					},
					{
						key: "members",
						icon: "🎺",
						title: t("admin.landing.members_title"),
						stat: t("admin.landing.members_stat", {
							members: totalMembers,
							sections: data.members.sections.length,
						}),
						desc: t("admin.landing.members_desc"),
					},
					{
						key: "translations",
						icon: "🌐",
						title: t("admin.landing.translations_title", "VERTALINGEN"),
						stat: t("admin.translations.stat", {
							count: Object.values(en).reduce(
								(a, v) =>
									a + (typeof v === "object" ? Object.keys(v).length : 1),
								0,
							),
						}),
						desc: t(
							"admin.landing.translations_desc",
							"Beheer de teksten van de website in alle talen.",
						),
					},
					{
						key: "gallery",
						icon: "🖼️",
						title: t("admin.landing.gallery_title", "GALERIJ"),
						stat: t("admin.landing.gallery_stat", "BEHEER AFBEELDINGEN"),
						desc: t(
							"admin.landing.gallery_desc",
							"Upload en beheer afbeeldingen in de galerij.",
						),
					},
					{
						key: "redirects",
						icon: "🔗",
						title: t("admin.landing.redirects_title", "QR CODES"),
						stat: t("admin.landing.redirects_stat", "BEHEER QR LINKS"),
						desc: t(
							"admin.landing.redirects_desc",
							"Maak QR codes die je naar elke pagina of link kunt laten wijzen.",
						),
					},
				].map((c) => (
					<button
						type="button"
						key={c.key}
						onClick={() => onSelect(c.key)}
						onKeyDown={(e) => e.key === "Enter" && onSelect(c.key)}
						tabIndex={0}
						className="group relative block animate-fade-in cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-10 transition-all duration-300 hover:-translate-y-2 hover:border-pret-yellow hover:bg-white/10"
					>
						<div className="mb-6 text-5xl">{c.icon}</div>
						<Heading
							level={3}
							className="mb-3 text-4xl transition-colors group-hover:text-pret-yellow"
						>
							{c.title}
						</Heading>
						<div className="mb-4 font-bold text-pret-red text-sm uppercase tracking-[1.5px]">
							{c.stat}
						</div>
						<p className="text-lg text-white/60 leading-relaxed">{c.desc}</p>
						<div className="mt-8 font-bold font-display text-pret-yellow text-sm uppercase tracking-widest transition-transform group-hover:translate-x-2">
							{t("admin.landing.edit_button")}
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
