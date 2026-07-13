import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginScreen } from "@/pages/admin/views/LoginScreen";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: "nl", changeLanguage: vi.fn() },
	}),
}));

const AUTH_URL = "https://pretband-backend.vercel.app/api/auth";

const getPasswordInput = () =>
	screen.getByLabelText("admin.login.password_label") as HTMLInputElement;

const getSubmitButton = () =>
	screen.getByRole("button", { name: "admin.login.login_button" });

describe("LoginScreen", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
	});

	it("renders the title, subtitle, password field and submit button", () => {
		render(<LoginScreen onSuccess={vi.fn()} />);

		expect(screen.getByText("admin.login.title")).toBeInTheDocument();
		expect(screen.getByText("admin.login.subtitle")).toBeInTheDocument();
		expect(getPasswordInput()).toBeInTheDocument();
		expect(getPasswordInput().type).toBe("password");
		expect(getSubmitButton()).toBeInTheDocument();
	});

	it("updates the password input as the user types", () => {
		render(<LoginScreen onSuccess={vi.fn()} />);

		const input = getPasswordInput();
		fireEvent.change(input, { target: { value: "hunter2" } });

		expect(input.value).toBe("hunter2");
	});

	it("does not call fetch or onSuccess when submitting an empty password", () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const onSuccess = vi.fn();

		render(<LoginScreen onSuccess={onSuccess} />);

		fireEvent.click(getSubmitButton());

		expect(fetchMock).not.toHaveBeenCalled();
		expect(onSuccess).not.toHaveBeenCalled();
	});

	it("posts the password and calls onSuccess with the returned token on success", async () => {
		const fetchMock = vi.fn(async () => ({
			ok: true,
			status: 200,
			json: async () => ({ token: "secret-token" }),
		}));
		vi.stubGlobal("fetch", fetchMock);
		const onSuccess = vi.fn();

		render(<LoginScreen onSuccess={onSuccess} />);

		fireEvent.change(getPasswordInput(), { target: { value: "correct" } });
		fireEvent.click(getSubmitButton());

		await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("secret-token"));

		expect(fetchMock).toHaveBeenCalledWith(
			AUTH_URL,
			expect.objectContaining({
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password: "correct" }),
			}),
		);
	});

	it("falls back to 'authenticated' when the response has no token", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				ok: true,
				status: 200,
				json: async () => ({}),
			})),
		);
		const onSuccess = vi.fn();

		render(<LoginScreen onSuccess={onSuccess} />);

		fireEvent.change(getPasswordInput(), { target: { value: "correct" } });
		fireEvent.click(getSubmitButton());

		await waitFor(() =>
			expect(onSuccess).toHaveBeenCalledWith("authenticated"),
		);
	});

	it("shows the error state and clears the input on a wrong password", async () => {
		vi.useFakeTimers();
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({ ok: false, status: 401, json: async () => ({}) })),
		);
		const onSuccess = vi.fn();

		render(<LoginScreen onSuccess={onSuccess} />);

		const input = getPasswordInput();
		fireEvent.change(input, { target: { value: "wrong" } });
		fireEvent.click(getSubmitButton());

		// Flush the awaited fetch/rejection microtasks.
		await vi.waitFor(() => {
			expect(input.className).toContain("border-pret-red");
		});

		expect(onSuccess).not.toHaveBeenCalled();
		// Input is cleared after a failed attempt.
		expect(input.value).toBe("");

		// The error auto-clears after its timeout.
		vi.advanceTimersByTime(2000);
		await vi.waitFor(() => {
			expect(input.className).not.toContain("border-pret-red");
		});

		vi.useRealTimers();
	});

	it("shows the loading label and disables the controls while a request is in flight", async () => {
		let resolveFetch: (value: unknown) => void = () => {};
		const pending = new Promise((resolve) => {
			resolveFetch = resolve;
		});
		vi.stubGlobal(
			"fetch",
			vi.fn(() => pending),
		);
		const onSuccess = vi.fn();

		render(<LoginScreen onSuccess={onSuccess} />);

		const input = getPasswordInput();
		fireEvent.change(input, { target: { value: "correct" } });
		fireEvent.click(getSubmitButton());

		// Button switches to the loading label and everything is disabled.
		const loadingButton = await screen.findByRole("button", {
			name: "admin.loading",
		});
		expect(loadingButton).toBeDisabled();
		expect(input).toBeDisabled();

		// Resolve the request; loading state clears.
		resolveFetch({
			ok: true,
			status: 200,
			json: async () => ({ token: "t" }),
		});

		await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("t"));
		expect(
			screen.getByRole("button", { name: "admin.login.login_button" }),
		).not.toBeDisabled();
	});
});
