import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/atoms/Badge";
import { Decoration } from "@/components/ui/atoms/Decoration";
import { Heading } from "@/components/ui/atoms/Heading";
import { EventCard } from "@/components/ui/molecules/EventCard";
import { useData } from "@/context/DataContext";
import { normalizeLang } from "@/utils/normalizeLang";

function generateIcsUrl(event: AgendaEvent) {
	const start = event.date.replace(/-/g, "");
	const nextDay = new Date(event.date);
	nextDay.setDate(nextDay.getDate() + 1);
	const end = nextDay.toISOString().split("T")[0].replace(/-/g, "");

	const now = `${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;

	const icsContent = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Pretband//Agenda//NL",
		"BEGIN:VEVENT",
		`UID:${event.id}@pretband.nl`,
		`DTSTAMP:${now}`,
		`DTSTART;VALUE=DATE:${start}`,
		`DTEND;VALUE=DATE:${end}`,
		`SUMMARY:Pretband - ${event.title}`,
		`LOCATION:${event.location}`,
		"END:VEVENT",
		"END:VCALENDAR",
	].join("\r\n");

	return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
}

export function Agenda() {
	const { t, i18n } = useTranslation();
	const { data } = useData();
	const lang = useMemo(() => normalizeLang(i18n.language), [i18n.language]);
	const events =
		data?.agenda.events.filter(
			(event: AgendaEvent) => new Date(event.date) > new Date(),
		) || [];

	return (
		<section id="agenda" className="relative py-40">
			{/* Background Text */}
			<div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-5 select-none">
				<span className="animate-tilt font-display text-[30rem] font-black whitespace-nowrap uppercase">
					{t("agenda.bg_text")}
				</span>
			</div>

			<Decoration
				type="stars"
				color="red"
				animation="pulse"
				className="absolute top-40 right-[10%] opacity-10"
				size={100}
			/>
			<Decoration
				type="circle"
				color="yellow"
				animation="float"
				className="absolute bottom-20 left-[10%] opacity-5"
				size={150}
			/>

			<div className="relative mx-auto max-w-7xl px-6">
				<div className="mb-24 flex flex-col items-center justify-between md:flex-row">
					<Heading level={2} className="text-7xl leading-none md:text-[10rem]">
						{t("agenda.title_1")} <br />
						<span className="animate-lamp-flicker text-glow-yellow-lamp text-pret-yellow">
							{t("agenda.title_2")}
						</span>
					</Heading>
					<Badge
						variant="red"
						size="lg"
						animation="pulse"
						className="mt-8 rotate-12 transform md:mt-0"
					>
						{t("agenda.badge")}
					</Badge>
				</div>

				<div className="space-y-6">
					{events.map((event: AgendaEvent, i: number) => (
						<EventCard
							key={event.id}
							date={new Date(event.date).toLocaleDateString(lang, {
								day: "numeric",
								month: "long",
							})}
							title={event.title}
							location={event.location}
							actionText={t("agenda.download_ical")}
							calendarUrl={generateIcsUrl(event)}
							variant={i % 2 ? "red" : "yellow"}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
