import { createContext, useContext, useEffect, useState } from "react";

type EasterEggId = "doot" | "rainbow-star" | "bouncing-pret" | "confetti-rain";

interface EasterEggContextType {
	foundEggs: EasterEggId[];
	findEgg: (id: EasterEggId) => void;
	isAllFound: boolean;
	resetEggs: () => void;
}

const EasterEggContext = createContext<EasterEggContextType | undefined>(
	undefined,
);

export const EasterEggProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [foundEggs, setFoundEggs] = useState<EasterEggId[]>([]);

	// Persist to localStorage
	useEffect(() => {
		const stored = localStorage.getItem("pretband_eggs");
		if (stored) {
			try {
				setFoundEggs(JSON.parse(stored));
			} catch (e) {
				console.error("Failed to parse stored eggs", e);
			}
		}
	}, []);

	const findEgg = (id: EasterEggId) => {
		setFoundEggs((prev) => {
			if (prev.includes(id)) return prev;
			const next = [...prev, id];
			localStorage.setItem("pretband_eggs", JSON.stringify(next));
			return next;
		});
	};

	const resetEggs = () => {
		setFoundEggs([]);
		localStorage.removeItem("pretband_eggs");
	};

	const isAllFound = foundEggs.length === 4;

	return (
		<EasterEggContext.Provider
			value={{ foundEggs, findEgg, isAllFound, resetEggs }}
		>
			{children}
		</EasterEggContext.Provider>
	);
};

export const useEasterEggs = () => {
	const context = useContext(EasterEggContext);
	if (!context) {
		throw new Error("useEasterEggs must be used within an EasterEggProvider");
	}
	return context;
};
