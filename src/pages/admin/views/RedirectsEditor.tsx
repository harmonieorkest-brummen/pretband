import {
	ChevronDownCircle,
	ChevronUpCircle,
	Copy,
	Download,
	FileCode,
	Link as LinkIcon,
	QrCode as QrCodeIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/atoms/Button";
import { Input } from "@/components/ui/atoms/Input";
import {
	downloadQrPng,
	downloadQrSvg,
	QrCode,
} from "@/components/ui/atoms/QrCode";
import { AdminTopBar } from "@/components/ui/molecules/AdminTopBar";
import { publicEnv } from "@/config/publicEnv";
import { useToast } from "@/context/ToastContext";
import { AuthError, fetchRedirects, saveRedirects } from "@/utils/adminData";

// Rows carry a stable client-only key so React never keys on the editable slug.
type RedirectRow = RedirectEntry & { key: string };

let rowCounter = 0;
const makeKey = () => `redirect_${Date.now()}_${rowCounter++}`;

const SLUG_PATTERN = /^[a-z0-9-]{1,64}$/;

// On-site destinations, mapped to their section element ids (empty = home).
const INTERNAL_TARGETS: { id: string; section: string }[] = [
	{ id: "home", section: "" },
	{ id: "agenda", section: "agenda" },
	{ id: "contact", section: "contact" },
	{ id: "members", section: "leden" },
	{ id: "about", section: "wie" },
	{ id: "highlights", section: "highlights" },
	{ id: "gallery", section: "gallery" },
];

function siteOrigin(): string {
	if (typeof window !== "undefined" && window.location?.origin) {
		return window.location.origin;
	}
	return "https://pretband.nl";
}

function internalUrl(section: string): string {
	return section ? `${siteOrigin()}/#/#${section}` : `${siteOrigin()}/#/`;
}

// The stable URL the QR code encodes; only its destination changes.
function qrUrl(slug: string): string {
	return `${publicEnv.qrBaseUrl}/${slug}`;
}

function sanitizeSlug(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

interface RedirectsEditorProps {
	onBack: () => void;
	onLogout: () => void;
}

export function RedirectsEditor({ onBack, onLogout }: RedirectsEditorProps) {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [rows, setRows] = useState<RedirectRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [syncing, setSyncing] = useState(false);
	const [expanded, setExpanded] = useState<string | null>(null);
	const [flash, setFlash] = useState(false);

	const token = localStorage.getItem("band_admin_token");

	// biome-ignore lint/correctness/useExhaustiveDependencies: load once on mount
	useEffect(() => {
		(async () => {
			try {
				const data = await fetchRedirects();
				setRows((data.redirects ?? []).map((r) => ({ ...r, key: makeKey() })));
			} catch (err) {
				console.error(err);
				showToast(
					t("admin.redirects.load_error", "Failed to load QR codes"),
					"error",
				);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const patchRow = (key: string, patch: Partial<RedirectRow>) => {
		setRows((prev) =>
			prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
		);
	};

	const addRow = () => {
		const row: RedirectRow = {
			key: makeKey(),
			slug: "",
			url: "",
			label: "",
		};
		setRows((prev) => [...prev, row]);
		setExpanded(row.key);
	};

	const deleteRow = (key: string) => {
		setRows((prev) => prev.filter((r) => r.key !== key));
		setExpanded((p) => (p === key ? null : p));
	};

	const copy = async (value: string) => {
		try {
			await navigator.clipboard.writeText(value);
			showToast(t("admin.redirects.copied", "Copied to clipboard"), "success");
		} catch {
			showToast(t("admin.redirects.copy_error", "Could not copy"), "error");
		}
	};

	/** Returns an error message for the first invalid row, or null when valid. */
	const validate = (): string | null => {
		const seen = new Set<string>();
		for (const row of rows) {
			if (!SLUG_PATTERN.test(row.slug)) {
				return t("admin.redirects.invalid_slug", {
					slug: row.slug || "∅",
					defaultValue:
						'Invalid name "{{slug}}": use only lowercase letters, numbers and dashes.',
				});
			}
			if (seen.has(row.slug)) {
				return t("admin.redirects.duplicate_slug", {
					slug: row.slug,
					defaultValue: 'Duplicate name "{{slug}}".',
				});
			}
			seen.add(row.slug);

			try {
				const parsed = new URL(row.url);
				if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
					throw new Error("scheme");
				}
			} catch {
				return t("admin.redirects.invalid_url", {
					slug: row.slug,
					defaultValue:
						'"{{slug}}" needs a full destination URL starting with https://',
				});
			}
		}
		return null;
	};

	const handleSave = async () => {
		if (!token) return;
		const error = validate();
		if (error) {
			showToast(error, "error");
			return;
		}

		setSyncing(true);
		try {
			await saveRedirects(token, {
				redirects: rows.map(({ slug, url, label }) => ({ slug, url, label })),
			});
			// Refetch so scan counts stay in sync after a save.
			const fresh = await fetchRedirects();
			setRows((fresh.redirects ?? []).map((r) => ({ ...r, key: makeKey() })));
			setFlash(true);
			setTimeout(() => setFlash(false), 1600);
			showToast(
				t("admin.toasts.redirects_success", "QR codes saved to the cloud!"),
				"success",
			);
		} catch (err) {
			console.error(err);
			if (err instanceof AuthError) {
				showToast(
					t(
						"admin.toasts.session_expired",
						"Session expired, please log in again",
					),
					"error",
				);
				onLogout();
			} else {
				showToast(t("admin.toasts.save_error", "Save failed."), "error");
			}
		} finally {
			setSyncing(false);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-pret-yellow border-t-2 border-b-2" />
			</div>
		);
	}

	return (
		<div className="mx-auto min-h-screen max-w-6xl px-6 py-20">
			<AdminTopBar
				title={t("admin.redirects.title", "QR Codes")}
				stat={t("admin.redirects.stat", {
					count: rows.length,
					defaultValue: "{{count}} codes",
				})}
				onBack={onBack}
				onSave={handleSave}
				isSyncing={syncing}
				flash={flash}
				addItem={addRow}
				addItemLabel={t("admin.redirects.new_button", "New code")}
			/>

			<div className="mb-8 flex animate-fade-in items-center gap-4 rounded-2xl border border-pret-yellow/20 bg-pret-yellow/10 p-4">
				<span className="text-2xl">🔗</span>
				<p className="font-medium text-pret-yellow/80 text-sm leading-relaxed">
					{t("admin.redirects.notice", {
						base: publicEnv.qrBaseUrl,
						defaultValue:
							"Each code encodes a fixed link ({{base}}/name). Change where it points anytime — the printed code never changes. Keep the name the same once a code is printed.",
					})}
				</p>
			</div>

			<div className="flex flex-col gap-4">
				{rows.map((row) => {
					const open = expanded === row.key;
					const encoded = qrUrl(row.slug || "…");
					const filename = `qr-${row.slug || "code"}`;

					return (
						<div key={row.key} className="animate-fade-in">
							<button
								type="button"
								onClick={() => setExpanded(open ? null : row.key)}
								className={`relative flex w-full cursor-pointer items-center gap-4 overflow-hidden border bg-black/40 p-5 transition-colors hover:bg-black/60 ${open ? "rounded-t-2xl border-pret-yellow" : "rounded-2xl border-white/10"}`}
							>
								<span className="min-w-[80px] font-semibold text-pret-yellow">
									/{row.slug || "…"}
								</span>
								<span className="flex-1 truncate text-left text-sm text-white/60">
									{row.label ? `${row.label} · ` : ""}
									{row.url ||
										t("admin.redirects.no_target", "No destination yet")}
								</span>
								<div className="ml-auto flex items-center gap-4">
									<span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 font-bold text-[10px] text-white/60 uppercase tracking-widest">
										{t("admin.redirects.scans", {
											count: row.scans ?? 0,
											defaultValue: "{{count}} scans",
										})}
									</span>
									<span className="text-pret-yellow">
										{open ? <ChevronUpCircle /> : <ChevronDownCircle />}
									</span>
								</div>
							</button>

							{open && (
								<div className="animate-fade-in rounded-b-2xl border border-pret-yellow border-t-0 bg-black/80 p-6 md:p-8">
									<div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto]">
										<div className="flex flex-col gap-5">
											<Input
												id={`slug-${row.key}`}
												label={t("admin.redirects.fields.slug", "Code name")}
												value={row.slug}
												onChange={(e) =>
													patchRow(row.key, {
														slug: sanitizeSlug(e.target.value),
													})
												}
												placeholder="flyer"
												required
											/>
											<Input
												id={`label-${row.key}`}
												label={t("admin.redirects.fields.label", "Label")}
												value={row.label ?? ""}
												onChange={(e) =>
													patchRow(row.key, { label: e.target.value })
												}
												placeholder={t(
													"admin.redirects.fields.label_placeholder",
													"Summer flyer 2026",
												)}
											/>
											<Input
												id={`url-${row.key}`}
												label={t(
													"admin.redirects.fields.url",
													"Redirect destination",
												)}
												type="url"
												value={row.url}
												onChange={(e) =>
													patchRow(row.key, { url: e.target.value })
												}
												placeholder="https://…"
												required
											/>

											<div className="flex flex-col gap-2">
												<span className="font-display text-white/60 text-xs uppercase tracking-widest">
													{t("admin.redirects.quick_insert", "Quick insert")}
												</span>
												<div className="flex flex-wrap gap-2">
													{INTERNAL_TARGETS.map((target) => (
														<button
															key={target.section || "home"}
															type="button"
															onClick={() =>
																patchRow(row.key, {
																	url: internalUrl(target.section),
																})
															}
															className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70 text-xs transition-colors hover:border-pret-yellow hover:text-pret-yellow"
														>
															{t(
																`admin.redirects.targets.${target.id}`,
																target.id,
															)}
														</button>
													))}
													{publicEnv.instagramUrl && (
														<button
															type="button"
															onClick={() =>
																patchRow(row.key, {
																	url: publicEnv.instagramUrl as string,
																})
															}
															className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70 text-xs transition-colors hover:border-pret-yellow hover:text-pret-yellow"
														>
															Instagram
														</button>
													)}
													{publicEnv.tiktokUrl && (
														<button
															type="button"
															onClick={() =>
																patchRow(row.key, {
																	url: publicEnv.tiktokUrl as string,
																})
															}
															className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/70 text-xs transition-colors hover:border-pret-yellow hover:text-pret-yellow"
														>
															TikTok
														</button>
													)}
												</div>
											</div>

											<div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 p-4">
												<span className="flex items-center gap-2 font-display text-white/60 text-xs uppercase tracking-widest">
													<LinkIcon className="h-3.5 w-3.5" />
													{t("admin.redirects.encoded_url", "The QR points to")}
												</span>
												<div className="flex items-center gap-3">
													<code className="flex-1 truncate text-pret-yellow text-sm">
														{encoded}
													</code>
													<button
														type="button"
														onClick={() => copy(encoded)}
														className="shrink-0 text-white/60 transition-colors hover:text-pret-yellow"
														title={t("admin.redirects.copy", "Copy link")}
													>
														<Copy className="h-4 w-4" />
													</button>
												</div>
											</div>
										</div>

										<div className="flex flex-col items-center gap-4">
											{row.slug ? (
												<>
													<QrCode value={encoded} size={176} />
													<div className="flex gap-2">
														<Button
															variant="outline"
															size="sm"
															className="inline-flex items-center gap-2"
															onClick={() => downloadQrPng(encoded, filename)}
														>
															<Download className="h-4 w-4" /> PNG
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="inline-flex items-center gap-2"
															onClick={() => downloadQrSvg(encoded, filename)}
														>
															<FileCode className="h-4 w-4" /> SVG
														</Button>
													</div>
												</>
											) : (
												<div className="flex h-[176px] w-[176px] flex-col items-center justify-center rounded-xl border border-white/10 border-dashed text-center text-white/40 text-xs">
													<QrCodeIcon className="mb-2 h-8 w-8 opacity-50" />
													{t(
														"admin.redirects.need_slug",
														"Enter a code name to generate the QR",
													)}
												</div>
											)}
										</div>
									</div>

									<div className="mt-8 flex justify-end border-white/10 border-t pt-6">
										<Button
											variant="secondary"
											size="sm"
											onClick={() => deleteRow(row.key)}
										>
											{t("admin.redirects.delete_button", "Delete")}
										</Button>
									</div>
								</div>
							)}
						</div>
					);
				})}

				{rows.length === 0 && (
					<div className="py-20 text-center font-display text-white/40 uppercase tracking-widest">
						{t("admin.redirects.empty", "No QR codes yet. Create one!")}
					</div>
				)}
			</div>
		</div>
	);
}
