import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockExecute } = vi.hoisted(() => ({ mockExecute: vi.fn() }));

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: "nl", changeLanguage: vi.fn() },
	}),
	Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
	initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

vi.mock("@/config/publicEnv", () => ({
	publicEnv: {
		basinFormId: "test-form-id",
		recaptchaSiteKey: "test-site-key",
	},
}));

vi.mock("@/security/useRecaptchaV3", () => ({
	useRecaptchaV3: () => ({ execute: mockExecute }),
}));

window.IntersectionObserver = class {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof IntersectionObserver;

import { Contact } from "@/components/sections/Contact";

function fillForm({
	name = "Jane Doe",
	email = "jane@example.com",
	message = "Hello there, please book us!",
}: {
	name?: string;
	email?: string;
	message?: string;
} = {}) {
	if (name !== "")
		fireEvent.change(screen.getByLabelText("contact.form.name_label"), {
			target: { value: name },
		});
	if (email !== "")
		fireEvent.change(screen.getByLabelText("contact.form.email_label"), {
			target: { value: email },
		});
	if (message !== "")
		fireEvent.change(screen.getByLabelText("contact.form.message_label"), {
			target: { value: message },
		});
}

function submit(container: HTMLElement) {
	const form = container.querySelector("form");
	if (!form) throw new Error("form not found");
	fireEvent.submit(form);
	return form;
}

describe("Contact form submission", () => {
	beforeEach(() => {
		mockExecute.mockReset();
		mockExecute.mockResolvedValue("recaptcha-token");
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				ok: true,
				status: 200,
				json: async () => ({}),
			})),
		);
		window.ahoy = undefined;
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it("submits successfully and posts to the Basin action with a recaptcha token", async () => {
		const { container } = render(<Contact />);
		fillForm();
		submit(container);

		await waitFor(() =>
			expect(screen.getByText("contact.form.success")).toBeInTheDocument(),
		);

		expect(mockExecute).toHaveBeenCalledWith("submit");
		const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, opts] = fetchMock.mock.calls[0];
		expect(String(url)).toContain("https://usebasin.com/f/test-form-id");
		expect(opts.method).toBe("POST");
		const body = opts.body as FormData;
		expect(body.get("g-recaptcha-response")).toBe("recaptcha-token");
		expect(body.get("g-recaptcha-version")).toBe("v3");
		expect(body.get("name")).toBe("Jane Doe");
	});

	it("tracks the success event via ahoy when available", async () => {
		const track = vi.fn();
		// @ts-expect-error minimal ahoy stub for the analytics branch
		window.ahoy = { track };

		const { container } = render(<Contact />);
		fillForm();
		submit(container);

		await waitFor(() =>
			expect(screen.getByText("contact.form.success")).toBeInTheDocument(),
		);

		expect(track).toHaveBeenCalledWith("contact_submit_success", {
			form: "test-form-id",
		});
	});

	it("shows a validation shake and does not submit when fields are empty", async () => {
		const { container } = render(<Contact />);
		// Leave all fields empty.
		submit(container);

		await waitFor(() =>
			expect(container.querySelector(".animate-shake")).toBeInTheDocument(),
		);

		expect(fetch as unknown as ReturnType<typeof vi.fn>).not.toHaveBeenCalled();
		expect(mockExecute).not.toHaveBeenCalled();
		expect(screen.queryByText("contact.form.success")).not.toBeInTheDocument();
	});

	it("does not submit when only some fields are filled", async () => {
		const { container } = render(<Contact />);
		fillForm({ name: "Only Name", email: "", message: "" });
		submit(container);

		await waitFor(() =>
			expect(container.querySelector(".animate-shake")).toBeInTheDocument(),
		);
		expect(fetch as unknown as ReturnType<typeof vi.fn>).not.toHaveBeenCalled();
	});

	it("treats a filled honeypot as success without hitting the network", async () => {
		const { container } = render(<Contact />);
		fillForm();
		const honeypot = container.querySelector(
			'input[name="_gotcha"]',
		) as HTMLInputElement;
		fireEvent.change(honeypot, { target: { value: "i-am-a-bot" } });
		submit(container);

		await waitFor(() =>
			expect(screen.getByText("contact.form.success")).toBeInTheDocument(),
		);

		expect(fetch as unknown as ReturnType<typeof vi.fn>).not.toHaveBeenCalled();
		expect(mockExecute).not.toHaveBeenCalled();
	});

	it("shows a recaptcha error when token retrieval fails", async () => {
		mockExecute.mockRejectedValue(new Error("nope"));
		const { container } = render(<Contact />);
		fillForm();
		submit(container);

		await waitFor(() =>
			expect(
				screen.getByText("contact.form.recaptcha_error"),
			).toBeInTheDocument(),
		);
		expect(fetch as unknown as ReturnType<typeof vi.fn>).not.toHaveBeenCalled();
	});

	it("shows the server-provided error message when the response is not ok", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				ok: false,
				status: 422,
				json: async () => ({ error: "Basin rejected this" }),
			})),
		);

		const { container } = render(<Contact />);
		fillForm();
		submit(container);

		await waitFor(() =>
			expect(screen.getByText("Basin rejected this")).toBeInTheDocument(),
		);
	});

	it("falls back to a generic error when the failed response has no parseable body", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				ok: false,
				status: 500,
				json: async () => {
					throw new Error("invalid json");
				},
			})),
		);

		const { container } = render(<Contact />);
		fillForm();
		submit(container);

		await waitFor(() =>
			expect(
				screen.getByText("contact.form.error_generic"),
			).toBeInTheDocument(),
		);
	});

	it("shows a generic error when fetch itself rejects", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				throw new Error("");
			}),
		);

		const { container } = render(<Contact />);
		fillForm();
		submit(container);

		await waitFor(() =>
			expect(
				screen.getByText("contact.form.error_generic"),
			).toBeInTheDocument(),
		);
	});

	it("ignores a second submit while the first is still in flight", async () => {
		let resolveFetch: (v: unknown) => void = () => {};
		vi.stubGlobal(
			"fetch",
			vi.fn(
				() =>
					new Promise((resolve) => {
						resolveFetch = resolve;
					}),
			),
		);

		const { container } = render(<Contact />);
		fillForm();
		const form = submit(container);

		// Sending state is reflected in the button label.
		await waitFor(() =>
			expect(screen.getByText("contact.form.sending")).toBeInTheDocument(),
		);

		// Second submit while isSubmitting is true is a no-op.
		fireEvent.submit(form);

		resolveFetch({ ok: true, status: 200, json: async () => ({}) });

		await waitFor(() =>
			expect(screen.getByText("contact.form.success")).toBeInTheDocument(),
		);

		expect(fetch as unknown as ReturnType<typeof vi.fn>).toHaveBeenCalledTimes(
			1,
		);
	});
});
