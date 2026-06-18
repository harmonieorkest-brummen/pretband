import { lazy, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import en from "@/locales/en.json";
import nl from "@/locales/nl.json";
import { LandingScreen } from "@/pages/admin/views/LandingScreen";
import { LoginScreen } from "@/pages/admin/views/LoginScreen";
import {
	AuthError,
	persistData,
	saveAgenda,
	saveMembers,
	saveTranslations,
} from "@/utils/adminData";

const AgendaEditor = lazy(() =>
	import("@/pages/admin/views/AgendaEditor").then((m) => ({
		default: m.AgendaEditor,
	})),
);
const MembersEditor = lazy(() =>
	import("@/pages/admin/views/MembersEditor").then((m) => ({
		default: m.MembersEditor,
	})),
);
const TranslationsEditor = lazy(() =>
	import("@/pages/admin/views/TranslationsEditor").then((m) => ({
		default: m.TranslationsEditor,
	})),
);
const GalleryEditor = lazy(() =>
	import("@/pages/admin/views/GalleryEditor").then((m) => ({
		default: m.GalleryEditor,
	})),
);

export default function AdminPanel() {
	const { t } = useTranslation();
	const { showToast } = useToast();
	const [token, setToken] = useState(() =>
		localStorage.getItem("band_admin_token"),
	);
	const [view, setView] = useState("landing");
	const { data: contextData, loading, refetch } = useData();
	const [data, setData] = useState<SiteData | undefined>(contextData);
	const [syncing, setSyncing] = useState(false);

	useEffect(() => {
		if (contextData) {
			setData(contextData);
		}
	}, [contextData]);

	const handleChange = (next: SiteData) => {
		setData(next);
		persistData(next);
	};

	const handleSaveMembers = async () => {
		if (!token || !data) return;
		setSyncing(true);
		try {
			await saveMembers(token, data.members);
			await refetch();
			showToast(t("admin.toasts.members_success"), "success");
		} catch (err) {
			console.error(err);
			if (err instanceof AuthError) {
				showToast(
					t("admin.toasts.session_expired", "Sessie verlopen, log opnieuw in"),
					"error",
				);
				handleLogout();
			} else {
				showToast(t("admin.toasts.save_error"), "error");
			}
		} finally {
			setSyncing(false);
		}
	};

	const handleSaveAgenda = async () => {
		if (!token || !data) return;
		setSyncing(true);
		try {
			await saveAgenda(token, data.agenda);
			await refetch();
			showToast(t("admin.toasts.agenda_success"), "success");
		} catch (err) {
			console.error(err);
			if (err instanceof AuthError) {
				showToast(
					t("admin.toasts.session_expired", "Sessie verlopen, log opnieuw in"),
					"error",
				);
				handleLogout();
			} else {
				showToast(t("admin.toasts.save_error"), "error");
			}
		} finally {
			setSyncing(false);
		}
	};

	const handleSaveTranslations = async (
		nextNL: Record<string, unknown>,
		nextEN: Record<string, unknown>,
	) => {
		if (!token) return;
		setSyncing(true);
		try {
			await saveTranslations(token, { nl: nextNL, en: nextEN });
			showToast(
				t("admin.toasts.translations_success", "Vertalingen opgeslagen!"),
				"success",
			);
		} catch (err) {
			console.error(err);
			if (err instanceof AuthError) {
				showToast(
					t("admin.toasts.session_expired", "Sessie verlopen, log opnieuw in"),
					"error",
				);
				handleLogout();
			} else {
				showToast(t("admin.toasts.save_error"), "error");
			}
		} finally {
			setSyncing(false);
		}
	};

	const handleLogin = (t: string) => {
		localStorage.setItem("band_admin_token", t);
		setToken(t);
	};

	const handleLogout = () => {
		localStorage.removeItem("band_admin_token");
		setToken(null);
		setView("landing");
	};

	if (!token) return <LoginScreen onSuccess={handleLogin} />;

	if (loading || !data)
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-12 w-12 animate-spin rounded-full border-pret-yellow border-t-2 border-b-2" />
				<div className="ml-4 font-display text-white/60 uppercase tracking-widest">
					{t("admin.loading")}
				</div>
			</div>
		);

	if (
		view === "agenda" ||
		view === "members" ||
		view === "translations" ||
		view === "gallery"
	) {
		return (
			<Suspense
				fallback={
					<div className="flex min-h-screen items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-pret-yellow border-t-2 border-b-2" />
					</div>
				}
			>
				{view === "agenda" && (
					<AgendaEditor
						data={data}
						onChange={handleChange}
						onSave={handleSaveAgenda}
						isSyncing={syncing}
						onBack={() => setView("landing")}
					/>
				)}
				{view === "members" && (
					<MembersEditor
						data={data}
						onChange={handleChange}
						onSave={handleSaveMembers}
						isSyncing={syncing}
						onBack={() => setView("landing")}
					/>
				)}
				{view === "translations" && (
					<TranslationsEditor
						nl={nl}
						en={en}
						onSave={handleSaveTranslations}
						isSyncing={syncing}
						onBack={() => setView("landing")}
					/>
				)}
				{view === "gallery" && (
					<GalleryEditor
						onBack={() => setView("landing")}
						onLogout={handleLogout}
					/>
				)}
			</Suspense>
		);
	}

	return (
		<LandingScreen data={data} onSelect={setView} onLogout={handleLogout} />
	);
}
