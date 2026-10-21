export function BackgroundLayer() {
	return (
		<div className="bg-pret-dark pointer-events-none fixed inset-0 -z-10 overflow-hidden">
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
		</div>
	);
}
