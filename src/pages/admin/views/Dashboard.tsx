import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/atoms/Button";
import { AdminTopBar } from "@/components/ui/molecules/AdminTopBar";
import { useToast } from "@/context/ToastContext";
import { type AdminStats, AuthError, fetchStats } from "@/utils/adminData";

interface DashboardProps {
	onBack: () => void;
	onLogout: () => void;
}

const nf = new Intl.NumberFormat("nl-NL");
const CARD =
	"animate-fade-in rounded-[2rem] border border-white/10 bg-white/5 p-8";
const BIG = "font-display text-5xl text-pret-yellow tabular-nums";
const LABEL = "mt-3 font-bold text-pret-red text-sm uppercase tracking-[1.5px]";
const HINT = "mt-1 text-sm text-white/50";

function StatCard({
	icon,
	value,
	label,
	hint,
}: {
	icon: string;
	value: string;
	label: string;
	hint?: string;
}) {
	return (
		<div className={CARD}>
			<div className="mb-4 text-4xl">{icon}</div>
			<div className={BIG}>{value}</div>
			<div className={LABEL}>{label}</div>
			{hint && <div className={HINT}>{hint}</div>}
		</div>
	);
}

function SecurityCard({ security }: { security: AdminStats["security"] }) {
	const { t } = useTranslation();
	const lastLogin = security.lastLogin
		? new Date(security.lastLogin).toLocaleString("nl-NL")
		: t("admin.dashboard.security_never", "nog nooit");
	return (
		<div className={CARD}>
			<div className="mb-4 text-4xl">🔒</div>
			<div className={BIG}>{nf.format(security.failedLogins24h)}</div>
			<div className={LABEL}>
				{t("admin.dashboard.failed_logins", "Mislukte logins (24u)")}
			</div>
			<div className={HINT}>
				{t("admin.dashboard.last_login", "Laatste login")}: {lastLogin}
			</div>
		</div>
	);
}

function TrafficCard({ traffic }: { traffic: AdminStats["traffic"] }) {
	const { t } = useTranslation();
	if (!traffic.connected) {
		return (
			<div className={CARD}>
				<div className="mb-4 text-4xl">📈</div>
				<div className="font-display text-3xl text-white/40">
					{t("admin.dashboard.traffic_disconnected", "Niet gekoppeld")}
				</div>
				<div className={LABEL}>
					{t("admin.dashboard.traffic", "Websiteverkeer")}
				</div>
				<div className={HINT}>
					{t(
						"admin.dashboard.traffic_hint",
						"Koppel Google Analytics (GA4) in Vercel om bezoekers te zien.",
					)}
				</div>
			</div>
		);
	}
	return (
		<div className={CARD}>
			<div className="mb-4 text-4xl">📈</div>
			<div className="flex gap-8">
				<div>
					<div className={BIG}>{nf.format(traffic.activeUsers)}</div>
					<div className="mt-1 text-white/40 text-xs uppercase tracking-widest">
						{t("admin.dashboard.visitors", "Bezoekers")}
					</div>
				</div>
				<div>
					<div className={BIG}>{nf.format(traffic.pageViews)}</div>
					<div className="mt-1 text-white/40 text-xs uppercase tracking-widest">
						{t("admin.dashboard.pageviews", "Paginaweergaven")}
					</div>
				</div>
			</div>
			<div className={LABEL}>
				{t("admin.dashboard.traffic", "Websiteverkeer")} · {traffic.rangeDays}d
			</div>
		</div>
	);
}

function QrCard({ qr }: { qr: AdminStats["qr"] }) {
	const { t } = useTranslation();
	return (
		<div className={`${CARD} md:col-span-2 lg:col-span-3`}>
			<div className="flex flex-wrap items-baseline justify-between gap-4">
				<div>
					<div className="mb-2 text-4xl">🔗</div>
					<div className={BIG}>{nf.format(qr.totalScans)}</div>
					<div className={LABEL}>
						{t("admin.dashboard.qr_total", "QR-scans totaal")}
					</div>
				</div>
				{qr.topCode && (
					<div className="text-right">
						<div className="text-white/40 text-xs uppercase tracking-widest">
							{t("admin.dashboard.qr_top", "Populairste code")}
						</div>
						<div className="font-display text-2xl text-white">
							{qr.topCode.label || qr.topCode.slug}
						</div>
						<div className="text-pret-yellow text-sm">
							{t("admin.dashboard.qr_scans", "{{count}} scans", {
								count: qr.topCode.scans,
							})}
						</div>
					</div>
				)}
			</div>
			{qr.codes.length > 0 ? (
				<ul className="mt-6 divide-y divide-white/10">
					{qr.codes.map((c) => (
						<li
							key={c.slug}
							className="flex items-center justify-between gap-4 py-3"
						>
							<span className="truncate font-body text-white">
								{c.label || c.slug}{" "}
								<span className="text-sm text-white/40">/{c.slug}</span>
							</span>
							<span className="font-display text-pret-yellow tabular-nums">
								{nf.format(c.scans)}
							</span>
						</li>
					))}
				</ul>
			) : (
				<div className="mt-6 text-white/40">
					{t("admin.dashboard.qr_empty", "Nog geen QR-codes aangemaakt.")}
				</div>
			)}
		</div>
	);
}

export function Dashboard({ onBack, onLogout }: DashboardProps) {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		const token = localStorage.getItem("band_admin_token");
		if (!token) {
			onLogout();
			return;
		}
		setLoading(true);
		try {
			setStats(await fetchStats(token));
		} catch (err) {
			if (err instanceof AuthError) {
				onLogout();
			} else {
				showToast(
					t("admin.dashboard.load_error", "Kon statistieken niet laden"),
					"error",
				);
			}
		} finally {
			setLoading(false);
		}
	}, [onLogout, showToast, t]);

	useEffect(() => {
		load();
	}, [load]);

	return (
		<div className="mx-auto min-h-screen max-w-6xl px-6 py-20">
			<AdminTopBar
				title={t("admin.dashboard.title", "STATISTIEKEN")}
				stat={t("admin.dashboard.subtitle", "OVERZICHT VAN DE WEBSITE")}
				onBack={onBack}
				onSave={() => {}}
				isSyncing={false}
				flash={false}
				hideSaveButton
			>
				<Button
					variant="outline"
					size="sm"
					onClick={load}
					className="inline-flex items-center gap-2"
				>
					<RefreshCw className={loading ? "animate-spin" : ""} />
					{t("admin.dashboard.refresh", "Vernieuwen")}
				</Button>
			</AdminTopBar>

			{loading && !stats ? (
				<div className="flex justify-center py-32">
					<div className="h-10 w-10 animate-spin rounded-full border-pret-yellow border-t-2 border-b-2" />
				</div>
			) : stats ? (
				<div className="grid animate-fade-in grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<StatCard
						icon="🎉"
						value={nf.format(stats.confetti.bursts)}
						label={t("admin.dashboard.confetti", "Confetti afgevuurd")}
						hint={t("admin.dashboard.confetti_hint", "bursts sinds de start")}
					/>
					<StatCard
						icon="📬"
						value={nf.format(stats.contact.submissions)}
						label={t("admin.dashboard.contact", "Contactberichten")}
						hint={t("admin.dashboard.contact_hint", "succesvol verzonden")}
					/>
					<SecurityCard security={stats.security} />
					<TrafficCard traffic={stats.traffic} />
					<QrCard qr={stats.qr} />
				</div>
			) : (
				<div className="py-32 text-center">
					<p className="mb-6 text-white/50">
						{t("admin.dashboard.empty", "Geen statistieken beschikbaar.")}
					</p>
					<Button variant="outline" size="sm" onClick={load}>
						{t("admin.dashboard.retry", "Opnieuw proberen")}
					</Button>
				</div>
			)}
		</div>
	);
}
