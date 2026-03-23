import { ArrowBigDownDash } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "../assets/images/logo.png";
import { Badge } from "./ui/atoms/Badge";
import { Button } from "./ui/atoms/Button";
import { Decoration } from "./ui/atoms/Decoration";
import { useEasterEggs } from "../context/EasterEggContext";

interface HeroProps {
	onLaunchConfetti: () => void;
}

export function Hero({ onLaunchConfetti }: HeroProps) {
	const { t } = useTranslation();
	const { findEgg } = useEasterEggs();

	const handleLogoClick = () => {
		onLaunchConfetti();
		findEgg("confetti-rain");
	};

	return (
		<section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-48 pb-20">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<Decoration
					type="star"
					color="yellow"
					animation="bounce"
					className="absolute top-[15%] left-[15%]"
					size={60}
				/>
				<Decoration
					type="star"
					color="red"
					animation="pulse"
					className="absolute top-[25%] right-[20%]"
					size={40}
				/>
				<Decoration
					type="zap"
					color="yellow"
					animation="wiggle"
					className="absolute bottom-[20%] left-[20%]"
					size={80}
				/>
				<Decoration
					type="plus"
					color="white"
					animation="spin"
					className="absolute top-1/3 left-[10%] opacity-10"
					size={30}
				/>
			</div>

			<div className="z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
				{/* Logo & Headline Group */}
				<div className="relative mb-8 flex flex-col items-center">
					<button
						type="button"
						className="group relative z-20 cursor-pointer rounded-full transition-transform hover:scale-105 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-pret-yellow active:scale-95"
						onClick={handleLogoClick}
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleLogoClick();
							}
						}}
					>
						<div className="absolute -inset-8 scale-0 rounded-full bg-pret-yellow/20 blur-3xl transition-transform duration-500 group-hover:scale-100"></div>
						<img
							fetchPriority="high"
							src={logo}
							alt="Pretband Logo"
							width="320"
							height="320"
							className="relative z-10 mx-auto h-48 w-48 rounded-full drop-shadow-[0_0_40px_rgba(235,182,77,0.3)] transition-all group-hover:rotate-3 md:h-72 md:w-72 lg:h-80 lg:w-80"
						/>
						<Badge
							animation="bounce"
							variant="yellow"
							className="absolute -top-6 -right-6 rotate-12 border-4 border-pret-dark shadow-xl md:-top-8 md:-right-8"
							size="md"
						>
							{t("hero.click_me")}
						</Badge>
					</button>

					<div className="z-10 m-6 -rotate-2 transform">
						<Badge
							variant="red"
							size="lg"
							className="skew-x-[-8deg] rounded-full px-8 py-3 text-lg shadow-2xl md:text-2xl"
						>
							{t("hero.tagline")}
						</Badge>
					</div>
				</div>

				{/* Narrative - Wrapped in a Red Block */}
				<div className="relative mx-auto mb-16 max-w-4xl rotate-1 transform leading-2 md:leading-none">
					<div className="absolute -inset-4 -rotate-2 rounded-5xl bg-[#D42A29] shadow-2xl"></div>
					<div className="absolute -inset-4 rotate-1 rounded-5xl border-4 border-pret-yellow opacity-50"></div>

					<p className="relative z-10 p-6 font-black font-display text-white text-xl uppercase leading-tight tracking-tight md:p-12 md:text-3xl lg:text-4xl">
						{t("hero.description_1")}
						<span className="px-2 text-white italic underline decoration-2 decoration-pret-yellow underline-offset-4">
							{t("hero.not")}
						</span>
						{t("hero.description_2")}
						<span className="px-2 text-white underline decoration-2 decoration-pret-yellow decoration-wavy underline-offset-4 md:underline-offset-8">
							{t("hero.vibe")}
						</span>
						{t("hero.description_3")}
						<span className="px-2 text-white underline decoration-2 decoration-pret-yellow underline-offset-4">
							{t("hero.party")}
						</span>
						{t("hero.description_4")}
						<span className="mt-4 block animate-lamp-flicker text-4xl text-pret-yellow italic md:text-7xl lg:text-8xl">
							{t("hero.noise")}!
						</span>
					</p>
				</div>

				{/* Action Area */}
				<div className="flex flex-col items-center justify-center gap-10 md:flex-row">
					<Button href="#contact" variant="primary" size="xl" className="group book-now">
						<span className="inline-block transition-transform group-hover:scale-110">
							{t("hero.book_now")}
						</span>
					</Button>
					<Button
						href="#agenda"
						variant="ghost"
						size="lg"
						className="hover:text-pret-yellow"
					>
						{t("hero.check_chaos")}{" "}
						<span className="ml-2 inline-block animate-bounce">
							<ArrowBigDownDash className="h-8 w-8" />
						</span>
					</Button>
				</div>
			</div>
		</section>
	);
}
