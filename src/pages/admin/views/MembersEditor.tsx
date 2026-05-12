import { Plus, Trash, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/atoms/Badge";
import { Button } from "@/components/ui/atoms/Button";
import { Heading } from "@/components/ui/atoms/Heading";
import { Input } from "@/components/ui/atoms/Input";
import { AdminTopBar } from "@/components/ui/molecules/AdminTopBar";

interface MembersEditorProps {
	data: SiteData;
	onChange: (data: SiteData) => void;
	onSave: () => void;
	isSyncing: boolean;
	onBack: () => void;
}

export function MembersEditor({
	data,
	onChange,
	onSave,
	isSyncing,
	onBack,
}: MembersEditorProps) {
	const { t } = useTranslation();
	const [sections, setSections] = useState(data.members.sections);
	const [newNames, setNewNames] = useState<Record<number, string>>({});
	const [flash, setFlash] = useState(false);

	const commit = (next: MembersSection[]) => {
		setSections(next);
		onChange({ ...data, members: { ...data.members, sections: next } });
		setFlash(true);
		setTimeout(() => setFlash(false), 1600);
	};

	const updateKey = (i: number, v: string) =>
		commit(
			sections.map((s: MembersSection, j: number) =>
				j === i ? { ...s, key: v } : s,
			),
		);
	const removeName = (si: number, ni: number) =>
		commit(
			sections.map((s: MembersSection, j: number) =>
				j === si
					? { ...s, names: s.names.filter((_: string, k: number) => k !== ni) }
					: s,
			),
		);
	const deleteSection = (i: number) =>
		commit(sections.filter((_: MembersSection, j: number) => j !== i));
	const addSection = () =>
		commit([...sections, { key: `sectie_${Date.now()}`, names: [] }]);

	const addName = (si: number) => {
		const n = (newNames[si] || "").trim();
		if (!n) return;
		commit(
			sections.map((s: MembersSection, j: number) =>
				j === si ? { ...s, names: [...s.names, n] } : s,
			),
		);
		setNewNames((p) => ({ ...p, [si]: "" }));
	};

	const total = sections.reduce(
		(a: number, s: MembersSection) => a + s.names.length,
		0,
	);

	return (
		<div className="mx-auto min-h-screen max-w-6xl px-6 py-20">
			<AdminTopBar
				title={t("admin.members.title")}
				stat={t("admin.members.stat", {
					members: total,
					sections: sections.length,
				})}
				onBack={onBack}
				onSave={onSave}
				isSyncing={isSyncing}
				flash={flash}
				addItem={addSection}
				addItemLabel={t("admin.members.new_section")}
			/>

			<div className="flex flex-col gap-8">
				{sections.map((sec: MembersSection, si: number) => {
					return (
						<div
							key={sec.key}
							className="animate-fade-in rounded-[2rem] border border-white/10 bg-black/40 p-8 md:p-10"
						>
							<div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center">
								<div className="flex-1">
									<Input
										id={`section-key-${si}`}
										label={t("admin.members.section_key")}
										value={sec.key}
										onChange={(e) => updateKey(si, e.target.value)}
										placeholder="section_key"
									/>
								</div>
								<div className="md:text-right">
									<Heading level={3} variant="yellow" className="text-3xl">
										{sec.key.replace(/_/g, " ")}
									</Heading>
									<div className="mt-2 text-white/60 text-xs uppercase tracking-widest">
										{t("admin.members.section_stat", {
											count: sec.names.length,
										})}
									</div>
								</div>
							</div>

							<div className="mb-8 flex min-h-[40px] flex-wrap items-center gap-3">
								{sec.names.length === 0 && (
									<span className="text-sm text-white/40 italic">
										{t("admin.members.no_members")}
									</span>
								)}
								{sec.names
									.sort((a: string, b: string) => a.localeCompare(b))
									.map((name: string, ni: number) => (
										<Badge
											key={name}
											variant="dark"
											size="sm"
											className="group flex items-center gap-2 border border-white/15 px-3 pr-2"
										>
											<span className="font-body">{name}</span>
											<button
												type="button"
												onClick={() => removeName(si, ni)}
												className="text-lg text-pret-red/30 leading-none transition-colors hover:text-pret-red"
												aria-label={t("admin.members.remove_aria", { name })}
											>
												<X />
											</button>
										</Badge>
									))}
							</div>

							<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
								<div className="flex w-full flex-1">
									<Input
										id={`add-name-${si}`}
										value={newNames[si] || ""}
										onChange={(e) =>
											setNewNames((p) => ({ ...p, [si]: e.target.value }))
										}
										onKeyDown={(e) => e.key === "Enter" && addName(si)}
										placeholder={t("admin.members.add_name_placeholder")}
										className="rounded-r-none border-r-0"
									/>
									<Button
										variant="outline"
										onClick={() => addName(si)}
										className="flex h-auto items-center justify-center rounded-l-none px-4"
									>
										<Plus />
									</Button>
								</div>
								<Button
									variant="ghost"
									onClick={() => deleteSection(si)}
									size="md"
									className="inline-flex items-center gap-2"
								>
									<Trash />
									{t("admin.members.delete_section")}
								</Button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
