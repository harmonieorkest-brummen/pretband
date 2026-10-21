import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Provide a working localStorage for all test workers
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
	getItem: (key: string) => localStorageStore[key] ?? null,
	setItem: (key: string, value: string) => {
		localStorageStore[key] = value;
	},
	removeItem: (key: string) => {
		delete localStorageStore[key];
	},
	clear: () => {
		for (const k in localStorageStore) delete localStorageStore[k];
	},
	get length() {
		return Object.keys(localStorageStore).length;
	},
	key: (i: number) => Object.keys(localStorageStore)[i] ?? null,
};
Object.defineProperty(globalThis, "localStorage", {
	value: localStorageMock,
	writable: true,
});

vi.mock("@/context/EasterEggContext", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@/context/EasterEggContext")>();
	return {
		...actual,
		useEasterEggs: () => ({
			findEgg: vi.fn(),
			foundEggs: [],
			isAllFound: false,
			resetEggs: vi.fn(),
		}),
	};
});
