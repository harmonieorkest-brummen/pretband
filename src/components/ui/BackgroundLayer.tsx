import { Decoration } from "./atoms/Decoration";

export function BackgroundLayer() {
	return (
		<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
			{/* Large Blurry Blobs for the "Splash" of colors */}
			<div className="absolute top-[-10%] -left-20 h-240 w-240 animate-pulse-slow rounded-full bg-pret-red/10 blur-[200px]"></div>
			<div className="absolute top-1/2 -right-40 h-200 w-200 animate-pulse-slow rounded-full bg-pret-yellow/10 blur-[180px] [animation-delay:1000ms]"></div>
			<div className="absolute -bottom-20 left-1/4 h-240 w-240 animate-pulse-slow rounded-full bg-pret-red/10 blur-[200px] [animation-delay:2000ms]"></div>

			{/* Global Background Decorations that cross sections */}
			<Decoration
				type="hamburger"
				color="red"
				animation="wiggle"
				className="absolute top-[35%] right-[5%] opacity-[0.03]"
				size={400}
			/>
			<Decoration
				type="zap"
				color="yellow"
				animation="pulse"
				className="absolute right-[10%] bottom-[5%] opacity-[0.03]"
				size={250}
			/>
			<Decoration
				type="heart"
				color="red"
				animation="float"
				className="absolute bottom-[45%] left-[10%] opacity-[0.03]"
				size={200}
			/>
		</div>
	);
}
