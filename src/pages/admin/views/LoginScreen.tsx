import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/atoms/Button";
import { Heading } from "@/components/ui/atoms/Heading";
import { Input } from "@/components/ui/atoms/Input";

export function LoginScreen({
	onSuccess,
}: {
	onSuccess: (token: string) => void;
}) {
	const { t } = useTranslation();
	const [val, setVal] = useState("");
	const [err, setErr] = useState(false);
	const [shake, setShake] = useState(false);
	const [loading, setLoading] = useState(false);

	const attempt = async (event?: React.FormEvent<HTMLFormElement>) => {
		event?.preventDefault();
		if (!val) return;
		setLoading(true);
		setErr(false);

		try {
			const res = await fetch("https://pretband-backend.vercel.app/api/auth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password: val }),
			});

			if (!res.ok) throw new Error("Unauthorized");

			const data = await res.json();
			onSuccess(data.token || "authenticated");
		} catch {
			setErr(true);
			setShake(true);
			setVal("");
			setTimeout(() => setShake(false), 480);
			setTimeout(() => setErr(false), 2000);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-[75vh]">
			<div className="w-full max-w-sm text-center animate-fade-in p-8">
				<Heading level={1} variant="yellow" className="text-7xl mb-2">
					{t("admin.login.title")}
				</Heading>
				<p className="text-white/60 text-xs tracking-[3px] uppercase mb-12">
					{t("admin.login.subtitle")}
				</p>

				<form
					onSubmit={attempt}
					autoComplete="on"
					className={`${shake ? "animate-wiggle" : ""}`}
				>
					<Input
						id="login-password"
						name="password"
						label={t("admin.login.password_label")}
						type="password"
						value={val}
						onChange={(e) => setVal(e.target.value)}
						placeholder="..."
						disabled={loading}
						autoComplete="current-password"
						className={`text-center text-2xl tracking-[6px] ${err ? "border-pret-red text-pret-red" : ""}`}
					/>
					<div
						className={`h-6 text-pret-red text-sm mt-2 transition-opacity ${err ? "opacity-100" : "opacity-0"}`}
					>
						{t("admin.login.password_error")}
					</div>

					<Button
						type="submit"
						disabled={loading}
						variant="primary"
						className="w-full mt-6"
						size="lg"
					>
						{loading ? t("admin.loading") : t("admin.login.login_button")}
					</Button>
				</form>
			</div>
		</div>
	);
}
