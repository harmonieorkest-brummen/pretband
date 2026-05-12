import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SecurityProvider } from "@/security/SecurityContext";
import { useRecaptchaV3 } from "@/security/useRecaptchaV3";

function wrapper({ children }: { children: React.ReactNode }) {
	return <SecurityProvider>{children}</SecurityProvider>;
}

describe("useRecaptchaV3", () => {
	it("returns an execute function", () => {
		const { result } = renderHook(
			() => useRecaptchaV3("test-key", false), // disabled so it doesn't try to load scripts
			{ wrapper },
		);
		expect(typeof result.current.execute).toBe("function");
	});

	it("does not inject a script when disabled", () => {
		renderHook(() => useRecaptchaV3("test-key", false), { wrapper });
		const script = document.querySelector('script[data-pret-recaptcha="v3"]');
		expect(script).toBeNull();
	});
});
