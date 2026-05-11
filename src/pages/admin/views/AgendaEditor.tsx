import { AlertTriangle, ChevronDownCircle, ChevronUpCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/atoms/Button";
import { Input } from "@/components/ui/atoms/Input";
import { AdminTopBar } from "@/components/ui/molecules/AdminTopBar";

const AGENDA_FIELDS = [
	{ field: "date", type: "date" },
	{ field: "title" },
	{ field: "location" },
];

interface AgendaEditorProps {
	data: SiteData;
	onChange: (data: SiteData) => void;
	onSave: () => void;
	isSyncing: boolean;
	onBack: () => void;
}

export function AgendaEditor({
	data,
	onChange,
	onSave,
	isSyncing,
	onBack,
}: AgendaEditorProps) {
	const { t } = useTranslation();
	const [events, setEvents] = useState(data.agenda.events);
	const [expanded, setExpanded] = useState<number | null>(null);
	const [flash, setFlash] = useState(false);

	const commit = (next: AgendaEvent[]) => {
		setEvents(next);
		onChange({ ...data, agenda: { ...data.agenda, events: next } });
		setFlash(true);
		setTimeout(() => setFlash(false), 1600);
	};

	const updateEvent = (idx: number, field: string, val: string) => {
		const finalVal =
			field === "title" || field === "location" ? val.toUpperCase() : val;
		commit(
			events.map((e: AgendaEvent, i: number) =>
				i !== idx ? e : { ...e, [field]: finalVal },
			),
		);
	};

	const deleteEvent = (idx: number) => {
		commit(events.filter((_: AgendaEvent, i: number) => i !== idx));
		setExpanded((p) => (p === idx ? null : p !== null && p > idx ? p - 1 : p));
	};

	const addEvent = () => {
		const next = [
			...events,
			{
				id: `event_${Date.now()}`,
				date: "",
				title: t("admin.agenda.new_event_placeholder"),
				location: "",
			},
		];
		commit(next);
		setExpanded(next.length - 1);
	};

	const getDaysUntilDeletion = (dateStr: string) => {
		if (!dateStr) return null;
		const eventDate = new Date(dateStr);
		const deletionDate = new Date(eventDate);
		deletionDate.setDate(deletionDate.getDate() + 30);
		const now = new Date();
		const diff = deletionDate.getTime() - now.getTime();
		return Math.ceil(diff / (1000 * 60 * 60 * 24));
	};

	return (
		<div className="py-20 px-6 max-w-6xl mx-auto min-h-screen">
			<AdminTopBar
				title={t("admin.agenda.title")}
				stat={t("admin.agenda.stat", { count: events.length })}
				onBack={onBack}
				onSave={onSave}
				isSyncing={isSyncing}
				flash={flash}
				addItem={addEvent}
				addItemLabel={t("admin.agenda.new_button")}
			/>

			<div className="mb-8 p-4 bg-pret-yellow/10 border border-pret-yellow/20 rounded-2xl flex items-center gap-4 animate-fade-in">
				<span className="text-2xl">ℹ️</span>
				<p className="text-pret-yellow/80 text-sm font-medium leading-relaxed">
					{t("admin.agenda.deletion_notice")}
				</p>
			</div>

			<div className="flex flex-col gap-4">
				{events.map((ev: AgendaEvent, idx: number) => {
					const open = expanded === idx;
					const daysLeft = getDaysUntilDeletion(ev.date);
					const isMissingDate = ev.date.trim() === "";

					return (
						<div key={ev.id} className="animate-fade-in">
							<button
								type="button"
								onClick={() => setExpanded(open ? null : idx)}
								onKeyDown={(e) =>
									e.key === "Enter" && setExpanded(open ? null : idx)
								}
								className={`w-full relative overflow-hidden border bg-black/40 p-5 flex items-center gap-4 cursor-pointer transition-colors hover:bg-black/60 ${open ? "border-pret-yellow rounded-t-2xl" : "border-white/10 rounded-2xl"}`}
							>
								<span className="text-white/60 text-sm min-w-[60px]">
									{ev.date || "—"}
								</span>
								<span className="text-white font-semibold flex-1 truncate text-left">
									{ev.title}
								</span>
								<div className="flex items-center gap-4 ml-auto">
									{isMissingDate && (
										<span className="inline-flex items-center gap-1 rounded-full border border-pret-red/30 bg-pret-red/15 px-2 py-1 text-[10px] font-bold text-pret-red uppercase tracking-widest">
											<AlertTriangle className="h-3 w-3" aria-hidden="true" />
											{t("admin.agenda.not_live_badge")}
										</span>
									)}
									{daysLeft !== null && new Date(ev.date) < new Date() && (
										<span
											className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${daysLeft <= 7 ? "bg-pret-red/20 text-pret-red border border-pret-red/30" : "bg-pret-yellow/10 text-pret-yellow border border-pret-yellow/20"}`}
										>
											{t("admin.agenda.days_until_deletion", {
												count: daysLeft,
											})}
										</span>
									)}
									<span className="text-white/60 text-sm hidden lg:block truncate max-w-[200px]">
										{ev.location || "—"}
									</span>
									<span className="text-pret-yellow">
										{open ? <ChevronUpCircle /> : <ChevronDownCircle />}
									</span>
								</div>
							</button>

							{open && (
								<div className="bg-black/80 border border-pret-yellow border-t-0 rounded-b-2xl p-6 md:p-8 animate-fade-in">
									{isMissingDate && (
										<div className="mb-6 flex gap-3 rounded-2xl border border-pret-red/30 bg-pret-red/10 p-4 text-pret-red">
											<AlertTriangle
												className="mt-0.5 h-5 w-5 shrink-0"
												aria-hidden="true"
											/>
											<p className="text-sm font-medium leading-relaxed">
												{t("admin.agenda.missing_date_warning")}
											</p>
										</div>
									)}

									<div className="mb-6">
										<Input
											id={`id-${idx}`}
											label={t("admin.agenda.fields.id")}
											value={ev.id}
											onChange={(e) => updateEvent(idx, "id", e.target.value)}
											placeholder="event_id_lowercase"
											required
										/>
									</div>

									{AGENDA_FIELDS.map(({ field, type }) => (
										<div key={field} className="mb-5">
											<Input
												id={`${field}-${idx}`}
												label={t(`admin.agenda.fields.${field}`)}
												type={type}
												className={
													field === "title" || field === "location"
														? "uppercase"
														: ""
												}
												value={ev[field as keyof AgendaEvent]}
												onChange={(e) =>
													updateEvent(idx, field, e.target.value)
												}
												placeholder={t(`admin.agenda.fields.${field}`)}
												required
											/>
										</div>
									))}

									<div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
										<Button
											variant="secondary"
											size="sm"
											onClick={() => deleteEvent(idx)}
										>
											{t("admin.agenda.delete_button")}
										</Button>
									</div>
								</div>
							)}
						</div>
					);
				})}

				{events.length === 0 && (
					<div className="text-center text-white/40 py-20 font-display tracking-widest uppercase">
						{t("admin.agenda.empty")}
					</div>
				)}
			</div>
		</div>
	);
}
