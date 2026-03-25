import { useTranslation } from "react-i18next";
import logo from "../assets/images/logo.png";
import { publicEnv } from "../config/publicEnv";
import { Decoration } from "./ui/atoms/Decoration";

export function Footer({ onOpenPrivacy }: { onOpenPrivacy: () => void }) {
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
						src={logo}
						alt="Pretband Logo"
						width="64"
						height="64"
						className="mx-auto h-16 w-16 rounded-full opacity-50 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0"
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
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-white/80 transition-colors hover:border-pret-yellow/60 hover:text-pret-yellow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
								aria-label={t("footer.instagram")}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
								>
									<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
								</svg>
								<span className="font-display text-sm uppercase tracking-widest">
									{t("footer.instagram")}
								</span>
							</a>
						)}

						{tiktokUrl && (
							<a
								href={tiktokUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-white/80 transition-colors hover:border-pret-yellow/60 hover:text-pret-yellow focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pret-yellow"
								aria-label={t("footer.tiktok")}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									viewBox="0 0 32 32"
									fill="currentColor"
									aria-hidden="true"
								>
									<path d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z" />
								</svg>
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
						rel="noopener noreferrer"
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
			<p className="mt-6 font-body text-white/50">{t("footer.copyright")}</p>

			<Decoration
				type="trumpet"
				color="yellow"
				size={30}
				className="absolute right-4 bottom-4 opacity-10"
				isEasterEgg
				eggId="doot"
			/>
		</footer>
	);
}
