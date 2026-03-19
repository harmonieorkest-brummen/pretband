import { Decoration } from "./atoms/Decoration";

export function BackgroundLayer() {
	return (
		<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
			{/* Large Blurry Blobs for the "Splash" of colors */}
			<div
				className="fixed -top-20 -left-40 h-240 w-240 rounded-full bg-[#E53433]/10 blur-[200px]"
				style={{
					contain: "strict",
				}}
			></div>
			<div
				className="fixed -right-40 -bottom-20 h-240 w-240 rounded-full bg-[#EBB64D]/10 blur-[200px]"
				style={{
					contain: "strict",
				}}
			></div>

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
