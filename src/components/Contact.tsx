import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { publicEnv } from "../config/publicEnv";
import { useEasterEggs } from "../context/EasterEggContext";
import { useRecaptchaV3 } from "../security/useRecaptchaV3";
import { Badge } from "./ui/atoms/Badge";
import { Button } from "./ui/atoms/Button";
import { Decoration } from "./ui/atoms/Decoration";
import { Heading } from "./ui/atoms/Heading";
import { Input } from "./ui/atoms/Input";
import { Textarea } from "./ui/atoms/Textarea";

export function Contact() {
	const { t } = useTranslation();
	const { findEgg } = useEasterEggs();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
	const [statusMessage, setStatusMessage] = useState<string>("");
	const [recaptchaToken, setRecaptchaToken] = useState<string>("");
	const [isNearContact, setIsNearContact] = useState(false);
	const sectionRef = useRef<HTMLElement>(null);

	const basinFormId = publicEnv.basinFormId;
	const basinAction = `https://usebasin.com/f/${basinFormId}`;
	const recaptchaSiteKey = publicEnv.recaptchaSiteKey;

	// Lazy load: only enable reCAPTCHA when the section is near the viewport.
	useEffect(() => {
		const target = sectionRef.current;
		if (!target) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setIsNearContact(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "300px" }, // Start loading when within 300px of the viewport
		);

		observer.observe(target);
		return () => observer.disconnect();
	}, []);

	// Public site key (ok to ship client-side). Basin verifies server-side with the secret key.
	const { execute: executeRecaptcha } = useRecaptchaV3(
		recaptchaSiteKey || "",
		isNearContact,
	);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (isSubmitting) return;

		setIsSubmitting(true);
		setStatus("idle");
		setStatusMessage("");
		setRecaptchaToken("");

		const form = e.currentTarget;
		const formData = new FormData(form);

		// Honeypot: if this is filled, treat as success but discard.
		const honeypot = (formData.get("_gotcha") ?? "").toString().trim();
		if (honeypot.length > 0) {
			setStatus("success");
			setStatusMessage(t("contact.form.success"));
			form.reset();
			setIsSubmitting(false);
			return;
		}

		try {
			let token = "";
			try {
				token = await executeRecaptcha("submit");
			} catch {
				throw new Error(t("contact.form.recaptcha_error"));
			}

			setRecaptchaToken(token);

			formData.set("g-recaptcha-response", token);
			formData.set("g-recaptcha-version", "v3");

			const res = await fetch(form.action, {
				method: "POST",
				body: formData,
				headers: { Accept: "application/json" },
			});

			if (!res.ok) {
				let msg = t("contact.form.error_generic");
				try {
					const data = await res.json();
					if (data?.error) msg = String(data.error);
				} catch {
					// ignore
				}
				throw new Error(msg);
			}

			setStatus("success");
			setStatusMessage(t("contact.form.success"));
			form.reset();

			// Track success without PII (only if analytics has been enabled and loaded).
			if (window.ahoy && "track" in window.ahoy) {
				window.ahoy.track?.("contact_submit_success", { form: basinFormId });
			}
		} catch (err) {
			setStatus("error");
			const fallback = t("contact.form.error_generic");
			setStatusMessage(
				err instanceof Error ? err.message || fallback : fallback,
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section id="contact" ref={sectionRef} className="relative py-40">
			<div className="pointer-events-none absolute inset-0">
				<Decoration
					type="zap"
					color="dark"
					animation="float"
					className="absolute right-[5%] bottom-20 opacity-5"
					size={120}
				/>
			</div>
			<div className="relative mx-auto max-w-4xl px-6 text-center">
				<Badge
					variant="yellow"
					size="lg"
					className="absolute -top-10 left-1/2 -translate-x-1/2 -rotate-12"
				>
					CONTACT
				</Badge>
				<Heading
					level={2}
					variant="white"
					glow
					className="mb-10 text-6xl leading-[0.8] drop-shadow-2xl md:text-9xl"
				>
					{t("contact.title_1")} <br />
					<button
						type="button"
						className="focus-visible:outline-hidden text-pret-red transition-transform hover:scale-110 active:animate-bounce inline-block"
						onClick={() => findEgg("bouncing-pret")}
					>
						{t("contact.title_2")}
					</button>
				</Heading>
				<p className="mx-auto mb-16 max-w-2xl font-body text-md md:text-3xl text-white/80 leading-tight">
					{t("contact.description")}
				</p>

				<div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 text-left shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur-xs md:p-10">
					<form
						method="POST"
						action={basinAction}
						onSubmit={onSubmit}
						noValidate
					>
						<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
							<Input
								id="contact_name"
								name="name"
								type="text"
								label={t("contact.form.name_label")}
								autoComplete="name"
								required
								placeholder={t("contact.form.name_placeholder")}
							/>
							<Input
								id="contact_email"
								name="email"
								type="email"
								label={t("contact.form.email_label")}
								autoComplete="email"
								required
								placeholder={t("contact.form.email_placeholder")}
							/>
							<div className="md:col-span-2">
								<Textarea
									id="contact_message"
									name="message"
									label={t("contact.form.message_label")}
									rows={6}
									required
									placeholder={t("contact.form.message_placeholder")}
									className="min-h-40 resize-y"
								/>
							</div>

							{/* Required hidden inputs for reCAPTCHA v3 (also set in FormData on submit) */}
							<input
								type="hidden"
								name="g-recaptcha-response"
								value={recaptchaToken}
							/>
							<input type="hidden" name="g-recaptcha-version" value="v3" />

							{/* Honeypot: should stay empty */}
							<div className="absolute left-[5000px]" aria-hidden="true">
								<label htmlFor="contact__gotcha">Gotcha</label>
								<input
									id="contact__gotcha"
									name="_gotcha"
									type="text"
									tabIndex={-1}
									autoComplete="off"
								/>
							</div>
						</div>

						<div className="mt-10 flex flex-col items-stretch justify-center gap-6 md:flex-row md:items-center">
							<Button
								type="submit"
								disabled={isSubmitting}
								variant="secondary"
								size="xl"
								className="w-full px-16 py-7 text-3xl shadow-[0_20px_0_#9d2423] md:w-auto"
							>
								{isSubmitting ? t("contact.form.sending") : t("contact.button")}
							</Button>
							<a
								href="mailto:info@pretbandhob.nl"
								className="rounded-xl px-4 py-4 text-center font-display text-white/80 uppercase tracking-widest transition-colors hover:text-pret-yellow focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-pret-yellow focus-visible:ring-offset-4 focus-visible:ring-offset-pret-dark"
							>
								{t("contact.form.or_email")}
							</a>
						</div>

						{status !== "idle" && (
							<output
								aria-live="polite"
								className={`mt-8 text-center font-body text-xl ${status === "success" ? "text-pret-yellow" : "text-pret-red"
									}`}
							>
								{statusMessage}
							</output>
						)}

						<p className="mt-8 text-center font-body text-sm text-white/50 leading-relaxed">
							{t("contact.form.recaptcha_notice")}{" "}
							<a
								href="https://policies.google.com/privacy"
								target="_blank"
								rel="noreferrer"
								className="underline underline-offset-4 transition-colors hover:text-pret-yellow"
							>
								{t("contact.form.recaptcha_privacy")}
							</a>{" "}
							{t("contact.form.recaptcha_and")}{" "}
							<a
								href="https://policies.google.com/terms"
								target="_blank"
								rel="noreferrer"
								className="underline underline-offset-4 transition-colors hover:text-pret-yellow"
							>
								{t("contact.form.recaptcha_terms")}
							</a>
							.
						</p>
					</form>
				</div>
			</div>
		</section>
	);
}
