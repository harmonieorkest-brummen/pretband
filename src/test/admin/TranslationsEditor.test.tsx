import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TranslationsEditor } from "@/pages/admin/views/TranslationsEditor";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: "nl", changeLanguage: vi.fn() },
	}),
	Trans: ({ children }: { children: React.ReactNode }) => children,
	initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

const nl: Record<string, unknown> = {
	admin: { title: "Beheer", save: "Opslaan" },
	home: { welcome: "Welkom thuis" },
};

const en: Record<string, unknown> = {
	admin: { title: "Admin", save: "Save" },
	home: { welcome: "Welcome home" },
};

const renderEditor = (
	overrides: Partial<React.ComponentProps<typeof TranslationsEditor>> = {},
) => {
	const onSave = vi.fn(overrides.onSave);
	const onBack = vi.fn(overrides.onBack);
	render(
		<TranslationsEditor
			nl={nl}
			en={en}
			onSave={onSave}
			isSyncing={overrides.isSyncing ?? false}
			onBack={onBack}
		/>,
	);
	return { onSave, onBack };
};

describe("TranslationsEditor", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("renders the title and section headers, collapsed by default", () => {
		renderEditor();

		expect(screen.getByText("admin.translations.title")).toBeInTheDocument();
		// Section headers derived from the first key segment.
		expect(screen.getByText("admin")).toBeInTheDocument();
		expect(screen.getByText("home")).toBeInTheDocument();

		// Collapsed by default => no textareas rendered yet.
		expect(screen.queryByDisplayValue("Beheer")).not.toBeInTheDocument();
	});

	it("expands a section to reveal editable translation values", () => {
		renderEditor();

		fireEvent.click(screen.getByText("admin"));

		expect(screen.getByDisplayValue("Beheer")).toBeInTheDocument();
		expect(screen.getByDisplayValue("Admin")).toBeInTheDocument();
		expect(screen.getByDisplayValue("Opslaan")).toBeInTheDocument();
		expect(screen.getByDisplayValue("Save")).toBeInTheDocument();
	});

	it("toggles all sections open with expand/collapse-all button", () => {
		renderEditor();

		// Starts collapsed => label is expand_all.
		const toggle = screen.getByText("admin.translations.expand_all");
		fireEvent.click(toggle);

		// All values now visible.
		expect(screen.getByDisplayValue("Beheer")).toBeInTheDocument();
		expect(screen.getByDisplayValue("Welkom thuis")).toBeInTheDocument();

		// Label flipped to collapse_all.
		const collapseToggle = screen.getByText("admin.translations.collapse_all");
		fireEvent.click(collapseToggle);
		expect(screen.queryByDisplayValue("Beheer")).not.toBeInTheDocument();
	});

	it("edits a Dutch value and saves the unflattened result", () => {
		vi.useFakeTimers();
		const { onSave } = renderEditor();

		fireEvent.click(screen.getByText("admin"));

		const nlTitle = screen.getByDisplayValue("Beheer");
		fireEvent.change(nlTitle, { target: { value: "Nieuwe titel" } });
		expect(screen.getByDisplayValue("Nieuwe titel")).toBeInTheDocument();

		fireEvent.click(screen.getByText("admin.members.save_cloud"));

		expect(onSave).toHaveBeenCalledTimes(1);
		const [savedNl, savedEn] = onSave.mock.calls[0];
		expect(savedNl).toEqual({
			admin: { title: "Nieuwe titel", save: "Opslaan" },
			home: { welcome: "Welkom thuis" },
		});
		expect(savedEn).toEqual({
			admin: { title: "Admin", save: "Save" },
			home: { welcome: "Welcome home" },
		});

		// Flash resets after the timeout.
		vi.runAllTimers();
		vi.useRealTimers();
	});

	it("edits an English value", () => {
		const { onSave } = renderEditor();

		fireEvent.click(screen.getByText("home"));

		const enWelcome = screen.getByDisplayValue("Welcome home");
		fireEvent.change(enWelcome, { target: { value: "Hi there" } });

		fireEvent.click(screen.getByText("admin.members.save_cloud"));

		const [, savedEn] = onSave.mock.calls[0];
		expect(savedEn).toMatchObject({ home: { welcome: "Hi there" } });
	});

	it("filters by search across key, nl and en values, auto-expanding matches", () => {
		renderEditor();

		const searchInput = screen.getByPlaceholderText(
			"admin.translations.search_placeholder",
		);
		fireEvent.change(searchInput, { target: { value: "welkom" } });

		// Matching section is auto-expanded (search overrides collapsed state).
		expect(screen.getByDisplayValue("Welkom thuis")).toBeInTheDocument();
		// Non-matching values are filtered out.
		expect(screen.queryByDisplayValue("Beheer")).not.toBeInTheDocument();
	});

	it("shows an empty state when the search matches nothing", () => {
		renderEditor();

		const searchInput = screen.getByPlaceholderText(
			"admin.translations.search_placeholder",
		);
		fireEvent.change(searchInput, {
			target: { value: "zzz-nonexistent-term" },
		});

		expect(
			screen.getByText("admin.translations.no_results"),
		).toBeInTheDocument();
	});

	it("invokes onBack when the back control is used", () => {
		const { onBack } = renderEditor();
		// Back button is the first button (ghost, icon only).
		const buttons = screen.getAllByRole("button");
		fireEvent.click(buttons[0]);
		expect(onBack).toHaveBeenCalledTimes(1);
	});

	it("disables the save button while syncing", () => {
		renderEditor({ isSyncing: true });
		const saving = screen.getByText("admin.landing.saving");
		expect(saving.closest("button")).toBeDisabled();
	});

	describe("export", () => {
		let clickSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			vi.stubGlobal("URL", {
				...URL,
				createObjectURL: vi.fn(() => "blob:mock"),
			});
			clickSpy = vi
				.spyOn(HTMLAnchorElement.prototype, "click")
				.mockImplementation(() => {});
		});

		afterEach(() => {
			clickSpy.mockRestore();
			vi.unstubAllGlobals();
		});

		it("exports translations to a JSON download", () => {
			renderEditor();

			fireEvent.click(screen.getByText("admin.landing.export_json"));

			expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
			expect(clickSpy).toHaveBeenCalledTimes(1);
		});
	});
});
