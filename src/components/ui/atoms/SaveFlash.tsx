export const SaveFlash = ({ visible }: { visible: boolean }) => (
	<span
		className={`text-pret-yellow text-sm font-bold transition-opacity duration-300 ${visible ? "animate-pulse opacity-100" : "opacity-0"}`}
	>
		✓ Opgeslagen
	</span>
);
