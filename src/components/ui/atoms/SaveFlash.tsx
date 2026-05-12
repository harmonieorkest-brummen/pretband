export const SaveFlash = ({ visible }: { visible: boolean }) => (
	<span
		className={`font-bold text-pret-yellow text-sm transition-opacity duration-300 ${visible ? "animate-pulse opacity-100" : "opacity-0"}`}
	>
		✓ Opgeslagen
	</span>
);
