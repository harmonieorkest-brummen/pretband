import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LandingScreen } from "@/pages/admin/views/LandingScreen";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

const baseData: SiteData = {
	members: {
		sections: [
			{ key: "s1", names: ["A", "B"] },
			{ key: "s2", names: ["C"] },
		],
	},
	agenda: {
		events: [
			{ id: "e1", date: "2026-01-01", title: "Show 1", location: "" },
			{ id: "e2", date: "2026-02-01", title: "Show 2", location: "" },
		],
	},
};

const SECTION_KEYS = [
	"dashboard",
	"agenda",
	"members",
	"translations",
	"gallery",
	"redirects",
] as const;

const TITLE_KEYS = [
	"admin.landing.dashboard_title",
	"admin.landing.agenda_title",
	"admin.landing.members_title",
	"admin.landing.translations_title",
	"admin.landing.gallery_title",
	"admin.landing.redirects_title",
];

function renderScreen(
	overrides: Partial<React.ComponentProps<typeof LandingScreen>> = {},
) {
	const onSelect = vi.fn();
	const onLogout = vi.fn();
	render(
		<LandingScreen
			data={baseData}
			onSelect={onSelect}
			onLogout={onLogout}
			{...overrides}
		/>,
	);
	return { onSelect, onLogout };
}

describe("LandingScreen", () => {
	it("renders the header title, subtitle and logout button", () => {
		renderScreen();
		expect(screen.getByText("admin.landing.title")).toBeInTheDocument();
		expect(screen.getByText("admin.landing.subtitle")).toBeInTheDocument();
		expect(screen.getByText("admin.landing.logout")).toBeInTheDocument();
	});

	it("renders all five admin section tiles with titles and edit labels", () => {
		renderScreen();
		for (const title of TITLE_KEYS) {
			expect(screen.getByText(title)).toBeInTheDocument();
		}
		// One "edit" label per tile.
		expect(screen.getAllByText("admin.landing.edit_button")).toHaveLength(6);
	});

	it("renders one clickable button per section plus the logout button", () => {
		renderScreen();
		// 6 tiles + 1 logout button.
		expect(screen.getAllByRole("button")).toHaveLength(7);
	});

	it("invokes onSelect with the correct key when each tile is clicked", () => {
		const { onSelect } = renderScreen();
		for (const key of SECTION_KEYS) {
			onSelect.mockClear();
			// Each tile title is unique, so we can locate the enclosing button.
			const title = {
				dashboard: "admin.landing.dashboard_title",
				agenda: "admin.landing.agenda_title",
				members: "admin.landing.members_title",
				translations: "admin.landing.translations_title",
				gallery: "admin.landing.gallery_title",
				redirects: "admin.landing.redirects_title",
			}[key];
			const tile = screen.getByText(title).closest("button");
			expect(tile).not.toBeNull();
			fireEvent.click(tile as HTMLElement);
			expect(onSelect).toHaveBeenCalledTimes(1);
			expect(onSelect).toHaveBeenCalledWith(key);
		}
	});

	it("invokes onSelect when Enter is pressed on a tile", () => {
		const { onSelect } = renderScreen();
		const tile = screen
			.getByText("admin.landing.agenda_title")
			.closest("button") as HTMLElement;
		fireEvent.keyDown(tile, { key: "Enter" });
		expect(onSelect).toHaveBeenCalledWith("agenda");
	});

	it("does not invoke onSelect for a non-Enter key", () => {
		const { onSelect } = renderScreen();
		const tile = screen
			.getByText("admin.landing.members_title")
			.closest("button") as HTMLElement;
		fireEvent.keyDown(tile, { key: "ArrowDown" });
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("invokes onLogout when the logout button is clicked without selecting a section", () => {
		const { onLogout, onSelect } = renderScreen();
		fireEvent.click(screen.getByText("admin.landing.logout"));
		expect(onLogout).toHaveBeenCalledTimes(1);
		expect(onSelect).not.toHaveBeenCalled();
	});

	it("computes member and section totals from the data (reduce branch)", () => {
		// The members stat aggregates 3 names across 2 sections; rendering
		// without throwing exercises the totalMembers reduce over sections.
		renderScreen();
		expect(screen.getByText("admin.landing.members_stat")).toBeInTheDocument();
		expect(screen.getByText("admin.landing.agenda_stat")).toBeInTheDocument();
	});

	it("renders correctly with empty data (empty reduce branches)", () => {
		const emptyData: SiteData = {
			members: { sections: [] } as Members,
			agenda: { events: [] } as Agenda,
		};
		renderScreen({ data: emptyData });
		// Still renders all tiles with empty aggregates.
		expect(screen.getAllByText("admin.landing.edit_button")).toHaveLength(6);
		expect(screen.getByText("admin.landing.title")).toBeInTheDocument();
	});
});
