import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";

export type GtmStatus = "idle" | "loading" | "ready";

interface GtmState {
	status: GtmStatus;
	tagId: string | null;
}

interface GtmContextType {
	state: GtmState;
	setState: React.Dispatch<React.SetStateAction<GtmState>>;
}

const GtmContext = createContext<GtmContextType | null>(null);

export function GtmProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<GtmState>({
		status: "idle",
		tagId: null,
	});

	const value = useMemo(() => ({ state, setState }), [state]);

	return <GtmContext.Provider value={value}>{children}</GtmContext.Provider>;
}

export function useGtmContext() {
	const context = useContext(GtmContext);
	if (!context) {
		throw new Error("useGtmContext must be used within a GtmProvider");
	}
	return context;
}
