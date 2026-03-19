import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";

export type AnalyticsStatus = "idle" | "loading" | "ready";

interface AnalyticsState {
	status: AnalyticsStatus;
	formId: string | null;
}

interface AnalyticsContextType {
	state: AnalyticsState;
	setState: React.Dispatch<React.SetStateAction<AnalyticsState>>;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<AnalyticsState>({
		status: "idle",
		formId: null,
	});

	const value = useMemo(() => ({ state, setState }), [state]);

	return (
		<AnalyticsContext.Provider value={value}>
			{children}
		</AnalyticsContext.Provider>
	);
}

export function useAnalyticsContext() {
	const context = useContext(AnalyticsContext);
	if (!context) {
		throw new Error(
			"useAnalyticsContext must be used within an AnalyticsProvider",
		);
	}
	return context;
}
