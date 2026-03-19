import { useTranslation } from "react-i18next";
import type { AnalyticsConsent } from "../../../privacy/useAnalyticsConsent";
import { Button } from "../atoms/Button";

interface AnalyticsConsentPopoverProps {
	isOpen: boolean;
	consent: AnalyticsConsent;
	onAccept: () => void;
	onDecline: () => void;
	onManageClose: () => void;
	onRevoke: () => void;
}

export function AnalyticsConsentPopover({
	isOpen,
	consent,
	onAccept,
	onDecline,
	onManageClose,
	onRevoke,
}: AnalyticsConsentPopoverProps) {
	const { t } = useTranslation();

	if (!isOpen) return null;

	const isUnknown = consent === "unknown";
	const isGranted = consent === "granted";

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-0 z-130 p-4 md:p-8">
			<div className="pointer-events-auto mx-auto max-w-xl md:mr-0 md:ml-auto">
				<div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-pret-dark/85 shadow-[0_30px_120px_rgba(0,0,0,0.6)] backdrop-blur-xl">
					<div
						className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-pret-yellow/10 blur-[80px]"
						aria-hidden="true"
					></div>
					<div
						className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-pret-red/10 blur-[80px]"
						aria-hidden="true"
					></div>

					<div className="relative p-6 md:p-8">
						<h2 className="font-display text-2xl text-white uppercase tracking-widest md:text-3xl">
							{t("privacy.analytics.title")}
						</h2>
						<p className="mt-3 font-body text-lg text-white/70 leading-snug">
							{t("privacy.analytics.body")}
						</p>

						{!isUnknown && (
							<p className="mt-4 font-display text-sm text-white/60 uppercase tracking-widest">
								{isGranted
									? t("privacy.analytics.status_on")
									: t("privacy.analytics.status_off")}
							</p>
						)}

						<div className="mt-6 flex flex-col gap-4 md:flex-row">
							{isUnknown && (
								<>
									<Button
										variant="secondary"
										size="lg"
										className="w-full md:w-auto"
										onClick={onAccept}
										type="button"
									>
										{t("privacy.analytics.accept")}
									</Button>
									<Button
										variant="outline"
										size="lg"
										className="w-full border-white/60 text-white hover:bg-white hover:text-pret-dark md:w-auto"
										onClick={onDecline}
										type="button"
									>
										{t("privacy.analytics.decline")}
									</Button>
								</>
							)}

							{isGranted && (
								<>
									<Button
										variant="outline"
										size="lg"
										className="w-full md:w-auto"
										onClick={onRevoke}
										type="button"
									>
										{t("privacy.analytics.disable")}
									</Button>
									<Button
										variant="ghost"
										size="lg"
										className="w-full md:w-auto"
										onClick={onManageClose}
										type="button"
									>
										{t("privacy.analytics.close")}
									</Button>
								</>
							)}

							{!isUnknown && !isGranted && (
								<>
									<Button
										variant="secondary"
										size="lg"
										className="w-full md:w-auto"
										onClick={onAccept}
										type="button"
									>
										{t("privacy.analytics.enable")}
									</Button>
									<Button
										variant="ghost"
										size="lg"
										className="w-full md:w-auto"
										onClick={onManageClose}
										type="button"
									>
										{t("privacy.analytics.close")}
									</Button>
								</>
							)}
						</div>

						<p className="mt-5 font-body text-sm text-white/45 leading-relaxed">
							{t("privacy.analytics.note")}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
