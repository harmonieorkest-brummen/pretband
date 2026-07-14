import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Contact } from "@/components/sections/Contact";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
	Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

vi.mock("@/config/publicEnv", () => ({
	publicEnv: {
		basinFormId: "test-form-id",
		recaptchaSiteKey: "test-site-key",
	},
}));

vi.mock("@/context/EasterEggContext", () => ({
	useEasterEggs: () => ({
		findEgg: vi.fn(),
	}),
}));

vi.mock("@/security/useRecaptchaV3", () => ({
	useRecaptchaV3: () => ({
		execute: vi.fn().mockResolvedValue("test-token"),
	}),
}));

vi.mock("@/utils/adminData", async (importOriginal) => ({
	...(await importOriginal<typeof import("@/utils/adminData")>()),
	trackEvent: vi.fn(),
}));

window.IntersectionObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof IntersectionObserver;

describe("Contact Component", () => {
	it("renders the contact form", () => {
		render(<Contact />);

		expect(screen.getByText("contact.title_1")).toBeInTheDocument();
		expect(screen.getByText("contact.title_2")).toBeInTheDocument();

		expect(
			screen.getByLabelText("contact.form.name_label"),
		).toBeInTheDocument();
		expect(
			screen.getByLabelText("contact.form.email_label"),
		).toBeInTheDocument();
		expect(
			screen.getByLabelText("contact.form.message_label"),
		).toBeInTheDocument();

		expect(
			screen.getByRole("button", { name: "contact.button" }),
		).toBeInTheDocument();
	});
});
