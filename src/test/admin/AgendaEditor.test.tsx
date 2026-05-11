import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AgendaEditor } from "@/pages/admin/views/AgendaEditor";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

const baseData: SiteData = {
	members: { sections: [] },
	agenda: { events: [] },
};

describe("AgendaEditor", () => {
	it("warns that a new event without a date is not shown live", () => {
		render(
			<AgendaEditor
				data={baseData}
				onChange={vi.fn()}
				onSave={vi.fn()}
				isSyncing={false}
				onBack={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByText("admin.agenda.new_button"));

		expect(screen.getByText("admin.agenda.not_live_badge")).toBeInTheDocument();
		expect(
			screen.getByText("admin.agenda.missing_date_warning"),
		).toBeInTheDocument();
	});
});
