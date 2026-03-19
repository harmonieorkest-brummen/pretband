import { Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";
import { publicEnv } from "../config/publicEnv";

interface FooterProps {
	onOpenPrivacy?: () => void;
}

export function Footer({ onOpenPrivacy }: FooterProps) {
	const { t } = useTranslation();

	const instagramUrl = publicEnv.instagramUrl;
	const tiktokUrl = publicEnv.tiktokUrl;

	return (
		<footer className="relative z-10 py-20 text-center">
			<div className="mb-10">
				<a
					href={location.origin}
					className="group inline-block rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
					aria-label={t("footer.back_to_top")}
				>
					<img
						src="/logo.png"
						alt="Pretband Logo"
						className="mx-auto h-16 rounded-full opacity-50 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0"
					/>
				</a>
			</div>
			<p className="font-display text-white text-xl uppercase tracking-[0.3em] opacity-60">
				{t("footer.tagline")}
			</p>

			<div className="mt-10 flex flex-col items-center gap-6">
				{(instagramUrl || tiktokUrl) && (
					<div className="flex flex-wrap items-center justify-center gap-4">
						<span className="font-display text-sm text-white/55 uppercase tracking-widest">
							{t("footer.follow")}
						</span>

						{instagramUrl && (
							<a
								href={instagramUrl}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-white/80 transition-colors hover:border-pret-yellow/60 hover:text-pret-yellow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
								aria-label={t("footer.instagram")}
							>
								<Instagram className="h-5 w-5" aria-hidden="true" />
								<span className="font-display text-sm uppercase tracking-widest">
									{t("footer.instagram")}
								</span>
							</a>
						)}

						{tiktokUrl && (
							<a
								href={tiktokUrl}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-white/80 transition-colors hover:border-pret-yellow/60 hover:text-pret-yellow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
								aria-label={t("footer.tiktok")}
							>
								<span className="font-display text-sm uppercase tracking-widest">
									{t("footer.tiktok")}
								</span>
							</a>
						)}
					</div>
				)}

				<p className="max-w-2xl font-body text-sm text-white/50 leading-relaxed">
					{t("footer.affiliation")}{" "}
					<a
						href="https://harmonieorkestbrummen.nl"
						target="_blank"
						rel="noreferrer"
						className="rounded-lg px-1 underline underline-offset-4 transition-colors hover:text-pret-yellow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
					>
						harmonieorkestbrummen.nl
					</a>
				</p>
			</div>

			{onOpenPrivacy && (
				<button
					type="button"
					onClick={onOpenPrivacy}
					className="mt-10 inline-flex items-center justify-center rounded-xl px-4 py-2 font-display text-sm text-white/60 uppercase tracking-widest transition-colors hover:text-pret-yellow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
				>
					{t("privacy.analytics.manage")}
				</button>
			)}
			<p className="mt-6 font-body text-white/40">{t("footer.copyright")}</p>
		</footer>
	);
}
