import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MembersEditor } from "@/pages/admin/views/MembersEditor";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		// Append interpolation options so tests can assert on counts.
		t: (key: string, opts?: Record<string, unknown>) =>
			opts ? `${key} ${JSON.stringify(opts)}` : key,
		i18n: { language: "nl", changeLanguage: vi.fn() },
	}),
}));

const makeData = (): SiteData => ({
	members: {
		sections: [
			{ key: "gitaar", names: ["Bob", "Alice"] },
			{ key: "drums", names: [] },
		],
	},
	agenda: { events: [] },
});

function renderEditor(
	overrides: Partial<Parameters<typeof MembersEditor>[0]> = {},
) {
	const onChange = vi.fn();
	const onSave = vi.fn();
	const onBack = vi.fn();
	const utils = render(
		<MembersEditor
			data={makeData()}
			onChange={onChange}
			onSave={onSave}
			isSyncing={false}
			onBack={onBack}
			{...overrides}
		/>,
	);
	return { onChange, onSave, onBack, ...utils };
}

/** Last section list committed via onChange. */
function lastSections(onChange: ReturnType<typeof vi.fn>): MembersSection[] {
	const lastCall = onChange.mock.calls.at(-1);
	if (!lastCall) throw new Error("onChange was never called");
	return (lastCall[0] as SiteData).members.sections;
}

/** Clicks the "add name" button that sits next to a section's add input. */
function clickAddButton(addInput: HTMLInputElement) {
	const button = addInput.closest("div.flex")?.querySelector("button");
	if (!button) throw new Error("add-name button not found");
	fireEvent.click(button);
}

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.runOnlyPendingTimers();
	vi.useRealTimers();
	vi.clearAllMocks();
});

describe("MembersEditor", () => {
	it("renders each section with its key and a sorted, alphabetised member list", () => {
		renderEditor();

		// Section key inputs are pre-filled.
		expect((screen.getByDisplayValue("gitaar") as HTMLInputElement).id).toBe(
			"section-key-0",
		);
		expect(screen.getByDisplayValue("drums")).toBeInTheDocument();

		// Names render, sorted alphabetically (Alice before Bob).
		const alice = screen.getByText("Alice");
		const bob = screen.getByText("Bob");
		expect(alice).toBeInTheDocument();
		expect(bob).toBeInTheDocument();
		expect(
			alice.compareDocumentPosition(bob) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});

	it("shows the total member count and section count in the top-bar stat", () => {
		renderEditor();
		// Two names across the sections, two sections.
		const stat = screen.getByText(/admin\.members\.stat/);
		expect(stat.textContent).toContain('"members":2');
		expect(stat.textContent).toContain('"sections":2');
	});

	it("renders an empty-state label for a section with no members", () => {
		renderEditor();
		expect(screen.getByText("admin.members.no_members")).toBeInTheDocument();
	});

	it("adds a new section via the top-bar add button", () => {
		const { onChange } = renderEditor();

		fireEvent.click(screen.getByText("admin.members.new_section"));

		expect(onChange).toHaveBeenCalledTimes(1);
		const sections = lastSections(onChange);
		expect(sections).toHaveLength(3);
		expect(sections[2].names).toEqual([]);
		expect(sections[2].key).toMatch(/^sectie_\d+$/);
	});

	it("deletes a section via the delete button", () => {
		const { onChange } = renderEditor();

		fireEvent.click(screen.getAllByText("admin.members.delete_section")[0]);

		const sections = lastSections(onChange);
		expect(sections).toHaveLength(1);
		expect(sections[0].key).toBe("drums");
	});

	it("edits a section key", () => {
		const { onChange } = renderEditor();

		fireEvent.change(screen.getByDisplayValue("gitaar"), {
			target: { value: "basgitaar" },
		});

		const sections = lastSections(onChange);
		expect(sections[0].key).toBe("basgitaar");
		expect(sections[1].key).toBe("drums");
	});

	it("adds a member name via the add button", () => {
		const { onChange } = renderEditor();

		const addInput = document.getElementById("add-name-0") as HTMLInputElement;
		fireEvent.change(addInput, { target: { value: "Charlie" } });
		// The Plus button sits next to the first section's add input.
		clickAddButton(addInput);

		const sections = lastSections(onChange);
		expect(sections[0].names).toContain("Charlie");
		expect(sections[0].names).toHaveLength(3);
		// Input is cleared after adding.
		expect(addInput.value).toBe("");
	});

	it("adds a member name when Enter is pressed", () => {
		const { onChange } = renderEditor();

		const addInput = document.getElementById("add-name-1") as HTMLInputElement;
		fireEvent.change(addInput, { target: { value: "Dave" } });
		fireEvent.keyDown(addInput, { key: "Enter" });

		const sections = lastSections(onChange);
		expect(sections[1].names).toEqual(["Dave"]);
	});

	it("does not add a member for empty or whitespace-only input", () => {
		const { onChange } = renderEditor();

		const addInput = document.getElementById("add-name-1") as HTMLInputElement;

		// Enter with no input at all.
		fireEvent.keyDown(addInput, { key: "Enter" });
		expect(onChange).not.toHaveBeenCalled();

		// Whitespace-only input via the button.
		fireEvent.change(addInput, { target: { value: "   " } });
		clickAddButton(addInput);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("does not commit on a non-Enter key press", () => {
		const { onChange } = renderEditor();

		const addInput = document.getElementById("add-name-0") as HTMLInputElement;
		fireEvent.change(addInput, { target: { value: "Eve" } });
		fireEvent.keyDown(addInput, { key: "a" });

		expect(onChange).not.toHaveBeenCalled();
	});

	it("removes a member name via the remove badge button", () => {
		const { onChange } = renderEditor();

		// Alice is sorted first; removing it should leave only Bob.
		fireEvent.click(
			screen.getByLabelText('admin.members.remove_aria {"name":"Alice"}'),
		);

		const sections = lastSections(onChange);
		expect(sections[0].names).toEqual(["Bob"]);
	});

	it("wires up back and save actions", () => {
		const { onSave, onBack } = renderEditor();

		fireEvent.click(screen.getByText("admin.members.save_cloud"));
		expect(onSave).toHaveBeenCalledTimes(1);

		// The back button is the icon-only ghost button (first button rendered).
		fireEvent.click(screen.getAllByRole("button")[0]);
		expect(onBack).toHaveBeenCalledTimes(1);
	});

	it("shows the saving label and disables save while syncing", () => {
		renderEditor({ isSyncing: true });

		const saveBtn = screen
			.getByText("admin.landing.saving")
			.closest("button") as HTMLButtonElement;
		expect(saveBtn).toBeDisabled();
	});

	it("clears the flash state after the timeout", () => {
		const { onChange } = renderEditor();

		fireEvent.click(screen.getByText("admin.members.new_section"));
		expect(onChange).toHaveBeenCalled();

		// Advance past the 1600ms flash timeout without errors.
		vi.advanceTimersByTime(2000);
	});
});
