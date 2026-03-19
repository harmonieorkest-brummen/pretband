import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";

export type SecurityStatus = "idle" | "loading" | "ready";

interface SecurityState {
	status: SecurityStatus;
	siteKey: string | null;
	promise: Promise<void> | null;
}

interface SecurityContextType {
	state: SecurityState;
	setState: React.Dispatch<React.SetStateAction<SecurityState>>;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<SecurityState>({
		status: "idle",
		siteKey: null,
		promise: null,
	});

	const value = useMemo(() => ({ state, setState }), [state]);

	return (
		<SecurityContext.Provider value={value}>
			{children}
		</SecurityContext.Provider>
	);
}

export function useSecurityContext() {
	const context = useContext(SecurityContext);
	if (!context) {
		throw new Error(
			"useSecurityContext must be used within a SecurityProvider",
		);
	}
	return context;
}
