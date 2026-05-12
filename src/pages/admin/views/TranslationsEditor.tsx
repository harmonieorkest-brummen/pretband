import { ChevronDown, Download, Globe, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/atoms/Button";
import { Input } from "@/components/ui/atoms/Input";
import { AdminTopBar } from "@/components/ui/molecules/AdminTopBar";
import { flatten, unflatten } from "@/utils/json";

interface TranslationsEditorProps {
	nl: Record<string, unknown>;
	en: Record<string, unknown>;
	onSave: (nl: Record<string, unknown>, en: Record<string, unknown>) => void;
	isSyncing: boolean;
	onBack: () => void;
}

export function TranslationsEditor({
	nl,
	en,
	onSave,
	isSyncing,
	onBack,
}: TranslationsEditorProps) {
	const { t } = useTranslation();
	const [flatNL, setFlatNL] = useState(() => flatten(nl));
	const [flatEN, setFlatEN] = useState(() => flatten(en));
	const [search, setSearch] = useState("");
	const [flash, setFlash] = useState(false);

	const keys = Object.keys(flatNL).filter(
		(k) =>
			k.toLowerCase().includes(search.toLowerCase()) ||
			flatNL[k].toLowerCase().includes(search.toLowerCase()) ||
			(flatEN[k]?.toLowerCase().includes(search.toLowerCase()) ?? false),
	);

	const handleUpdate = (lang: "nl" | "en", key: string, val: string) => {
		if (lang === "nl") {
			setFlatNL((prev) => ({ ...prev, [key]: val }));
		} else {
			setFlatEN((prev) => ({ ...prev, [key]: val }));
		}
	};

	const handleSave = () => {
		onSave(unflatten(flatNL), unflatten(flatEN));
		setFlash(true);
		setTimeout(() => setFlash(false), 2000);
	};

	const handleExport = () => {
		const data = { nl: unflatten(flatNL), en: unflatten(flatEN) };
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "translations.json";
		a.click();
	};

	const sections = Array.from(new Set(keys.map((k) => k.split(".")[0])));
	const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
		sections.reduce((acc: Record<string, boolean>, s) => {
			acc[s] = true;
			return acc;
		}, {}),
	);

	const toggleSection = (s: string) => {
		setCollapsed((prev) => ({ ...prev, [s]: !prev[s] }));
	};

	return (
		<div className="mx-auto min-h-screen max-w-[1600px] px-6 py-20 font-body">
			<AdminTopBar
				title={t("admin.translations.title", "Vertalingen")}
				stat={t("admin.translations.stat", {
					count: Object.keys(flatNL).length,
				})}
				onBack={onBack}
				onSave={handleSave}
				isSyncing={isSyncing}
				flash={flash}
			>
				<Button
					variant="secondary"
					size="sm"
					onClick={() => {
						const nextCollapseState = !Object.values(collapsed)[0];
						setCollapsed(
							sections.reduce((acc: Record<string, boolean>, s) => {
								acc[s] = nextCollapseState;
								return acc;
							}, {}),
						);
					}}
				>
					{Object.values(collapsed).some((v) => v)
						? t("admin.translations.expand_all")
						: t("admin.translations.collapse_all")}
				</Button>
				<Button variant="secondary" size="sm" onClick={handleExport}>
					<Download className="mr-2 h-4 w-4" />
					{t("admin.landing.export_json")}
				</Button>
			</AdminTopBar>

			<div className="sticky top-24 z-10 mb-8 transition-all duration-300">
				<div className="group relative">
					<Search className="absolute top-1/2 left-6 h-5 w-5 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-pret-yellow" />
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder={t(
							"admin.translations.search_placeholder",
							"Zoek op sleutel of tekst...",
						)}
						className="h-14 rounded-2xl border-white/10 bg-black/60 pl-16 backdrop-blur-3xl focus:border-pret-yellow/50"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-6">
				{Object.entries(
					keys.reduce((acc: Record<string, string[]>, k) => {
						const section = k.split(".")[0];
						if (!acc[section]) acc[section] = [];
						acc[section].push(k);
						return acc;
					}, {}),
				).map(([section, sectionKeys]) => {
					const isCollapsed = collapsed[section] && !search;
					return (
						<div
							key={section}
							className="flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition-all hover:bg-white/[0.05]"
						>
							<button
								type="button"
								onClick={() => toggleSection(section)}
								className="grid cursor-pointer grid-cols-[1fr,1.5fr,1.5fr] items-center gap-4 border-white/5 border-b bg-white/[0.03] px-6 py-4 text-left transition-colors hover:bg-white/[0.08]"
							>
								<div className="flex items-center gap-2">
									<Globe
										className={`transition-colors ${isCollapsed ? "text-white/20" : "text-pret-yellow"}`}
									/>
									<span className="font-display text-white uppercase tracking-[2.5px]">
										{section}
									</span>
									<span className="font-body text-white/20 lowercase">
										({sectionKeys.length})
									</span>
									<ChevronDown
										className={`ml-auto text-white/20 transition-transform duration-300 ${!isCollapsed ? "rotate-180 text-pret-yellow/40" : ""}`}
									/>
								</div>
							</button>

							{!isCollapsed && (
								<div className="grid grid-cols-1 divide-x divide-y divide-white/5 xl:grid-cols-2 2xl:grid-cols-3">
									{sectionKeys.map((k) => (
										<div
											key={k}
											className="grid grid-cols-[1fr,1.4fr,1.4fr] items-start gap-3 border-white/5 px-4 py-3 transition-colors hover:bg-white/[0.02]"
										>
											<div className="pt-2">
												<span
													className="block truncate break-all font-display text-white/40 uppercase leading-tight tracking-tight"
													title={k}
												>
													{k.split(".").slice(1).join(".") || k}
												</span>
											</div>
											<div className="relative">
												<span className="block truncate break-all font-display text-white/40 text-xs uppercase leading-tight tracking-tight">
													nl
												</span>
												<textarea
													id={`nl-${k}`}
													value={flatNL[k]}
													onChange={(e) =>
														handleUpdate("nl", k, e.target.value)
													}
													className="min-h-[38px] w-full resize-none rounded-lg border border-white/5 bg-black/40 px-3 py-2 font-body text-[13px] text-white leading-snug transition placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-pret-yellow/20"
												/>
											</div>
											<div className="relative">
												<span className="block truncate break-all font-display text-white/40 text-xs uppercase leading-tight tracking-tight">
													en
												</span>
												<textarea
													id={`en-${k}`}
													value={flatEN[k] || ""}
													onChange={(e) =>
														handleUpdate("en", k, e.target.value)
													}
													className="min-h-[38px] w-full resize-none rounded-lg border border-white/5 bg-black/40 px-3 py-2 font-body text-[13px] text-white leading-snug transition placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-pret-yellow/20"
												/>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					);
				})}

				{keys.length === 0 && (
					<div className="rounded-3xl border border-white/10 border-dashed bg-black/20 py-20 text-center font-display text-white/40 uppercase tracking-widest">
						{t("admin.translations.no_results", "Geen vertalingen gevonden")}
					</div>
				)}
			</div>
		</div>
	);
}
