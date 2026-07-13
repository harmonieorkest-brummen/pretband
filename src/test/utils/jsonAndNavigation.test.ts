import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flatten, unflatten } from "@/utils/json";
import {
	getSectionIdFromHash,
	navigateToSection,
	scrollToSection,
	sectionHref,
} from "@/utils/sectionNavigation";

describe("json utils", () => {
	describe("flatten", () => {
		it("returns an empty object for an empty input", () => {
			expect(flatten({})).toEqual({});
		});

		it("keeps top-level primitive keys and stringifies values", () => {
			expect(flatten({ a: "hello", b: 42, c: true })).toEqual({
				a: "hello",
				b: "42",
				c: "true",
			});
		});

		it("flattens nested objects into dot-notated keys", () => {
			expect(
				flatten({ outer: { inner: "value", deep: { leaf: "x" } } }),
			).toEqual({
				"outer.inner": "value",
				"outer.deep.leaf": "x",
			});
		});

		it("treats arrays as leaf values (does not recurse)", () => {
			const result = flatten({ list: [1, 2, 3] });
			expect(result).toEqual({ list: String([1, 2, 3]) });
			expect(result.list).toBe("1,2,3");
		});

		it("stringifies null leaf values", () => {
			// null is an object but the guard excludes it, so it hits the else branch
			expect(flatten({ nothing: null })).toEqual({ nothing: "null" });
		});

		it("honors an explicit prefix argument", () => {
			expect(flatten({ a: "1" }, "root")).toEqual({ "root.a": "1" });
			expect(flatten({ nested: { a: "1" } }, "root")).toEqual({
				"root.nested.a": "1",
			});
		});

		it("mixes primitives and nested objects at the same level", () => {
			expect(flatten({ name: "band", meta: { year: 2020 } })).toEqual({
				name: "band",
				"meta.year": "2020",
			});
		});
	});

	describe("unflatten", () => {
		it("returns an empty object for an empty input", () => {
			expect(unflatten({})).toEqual({});
		});

		it("rebuilds top-level keys", () => {
			expect(unflatten({ a: "hello", b: "world" })).toEqual({
				a: "hello",
				b: "world",
			});
		});

		it("rebuilds nested structure from dot-notated keys", () => {
			expect(
				unflatten({ "outer.inner": "value", "outer.deep.leaf": "x" }),
			).toEqual({
				outer: { inner: "value", deep: { leaf: "x" } },
			});
		});

		it("is the inverse of flatten for nested objects", () => {
			const original = {
				title: "Pretband",
				contact: { email: "a@b.nl", phone: "123" },
			};
			expect(unflatten(flatten(original))).toEqual(original);
		});

		it("does not overwrite an already-created intermediate branch", () => {
			// Both keys share the 'group' prefix; the branch must be reused.
			expect(unflatten({ "group.a": "1", "group.b": "2" })).toEqual({
				group: { a: "1", b: "2" },
			});
		});
	});
});

describe("sectionNavigation utils", () => {
	describe("sectionHref", () => {
		it("builds a hash href for a plain id", () => {
			expect(sectionHref("about")).toBe("#/#about");
		});

		it("URL-encodes special characters in the id", () => {
			expect(sectionHref("my section/2")).toBe("#/#my%20section%2F2");
		});
	});

	describe("getSectionIdFromHash", () => {
		it("extracts the section id from a matching hash", () => {
			expect(getSectionIdFromHash("#/#about")).toBe("about");
		});

		it("decodes URL-encoded ids", () => {
			expect(getSectionIdFromHash("#/#my%20section")).toBe("my section");
		});

		it("returns null for a non-matching hash", () => {
			expect(getSectionIdFromHash("#/other")).toBeNull();
			expect(getSectionIdFromHash("")).toBeNull();
			expect(getSectionIdFromHash("#no-slash")).toBeNull();
		});

		it("stops at reserved delimiter characters", () => {
			expect(getSectionIdFromHash("#/#about?foo=bar")).toBe("about");
			expect(getSectionIdFromHash("#/#about&x=1")).toBe("about");
			expect(getSectionIdFromHash("#/#about/extra")).toBe("about");
		});

		it("round-trips with sectionHref", () => {
			const id = "faq item 3";
			expect(getSectionIdFromHash(sectionHref(id))).toBe(id);
		});

		it("reads window.location.hash by default", () => {
			window.location.hash = "#/#defaulted";
			expect(getSectionIdFromHash()).toBe("defaulted");
		});
	});

	describe("scrollToSection", () => {
		afterEach(() => {
			vi.restoreAllMocks();
			vi.useRealTimers();
			document.body.innerHTML = "";
		});

		it("scrolls immediately and returns true when the element exists", () => {
			const el = document.createElement("div");
			el.id = "target";
			document.body.appendChild(el);
			const scrollSpy = vi.fn();
			el.scrollIntoView = scrollSpy;

			expect(scrollToSection("target")).toBe(true);
			expect(scrollSpy).toHaveBeenCalledWith({
				behavior: "smooth",
				block: "start",
			});
		});

		it("uses a custom behavior option", () => {
			const el = document.createElement("div");
			el.id = "target";
			document.body.appendChild(el);
			const scrollSpy = vi.fn();
			el.scrollIntoView = scrollSpy;

			scrollToSection("target", { behavior: "auto" });
			expect(scrollSpy).toHaveBeenCalledWith({
				behavior: "auto",
				block: "start",
			});
		});

		it("returns false and schedules retries when the element is missing", () => {
			vi.useFakeTimers();
			const setTimeoutSpy = vi.spyOn(window, "setTimeout");

			expect(scrollToSection("missing")).toBe(false);
			expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
		});

		it("retries and eventually scrolls once the element appears", () => {
			vi.useFakeTimers();

			// Element does not exist yet on the first call.
			expect(scrollToSection("late", { attempts: 3, intervalMs: 10 })).toBe(
				false,
			);

			// Now add it and let the scheduled retry fire.
			const el = document.createElement("div");
			el.id = "late";
			document.body.appendChild(el);
			const scrollSpy = vi.fn();
			el.scrollIntoView = scrollSpy;

			vi.advanceTimersByTime(10);
			expect(scrollSpy).toHaveBeenCalledTimes(1);
		});

		it("does not schedule a retry when attempts is zero", () => {
			vi.useFakeTimers();
			const setTimeoutSpy = vi.spyOn(window, "setTimeout");

			expect(scrollToSection("missing", { attempts: 0 })).toBe(false);
			expect(setTimeoutSpy).not.toHaveBeenCalled();
		});

		it("stops retrying after exhausting all attempts", () => {
			vi.useFakeTimers();
			const setTimeoutSpy = vi.spyOn(window, "setTimeout");

			scrollToSection("never", { attempts: 2, intervalMs: 5 });
			// First call schedules retry #1.
			expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
			vi.advanceTimersByTime(5); // retry with attempts=1 -> schedules retry #2
			expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
			vi.advanceTimersByTime(5); // retry with attempts=0 -> no more scheduling
			expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
		});
	});

	describe("navigateToSection", () => {
		let pushStateSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			window.location.hash = "";
			pushStateSpy = vi.spyOn(window.history, "pushState");
		});

		afterEach(() => {
			vi.restoreAllMocks();
			document.body.innerHTML = "";
		});

		it("pushes a new history entry and scrolls to an existing element", () => {
			const el = document.createElement("div");
			el.id = "contact";
			document.body.appendChild(el);
			const scrollSpy = vi.fn();
			el.scrollIntoView = scrollSpy;

			navigateToSection("contact");

			expect(pushStateSpy).toHaveBeenCalledTimes(1);
			const [, , url] = pushStateSpy.mock.calls[0];
			expect(String(url)).toContain("#/#contact");
			expect(scrollSpy).toHaveBeenCalled();
		});

		it("does not push history when already on the target hash", () => {
			window.location.hash = "#/#already";
			const el = document.createElement("div");
			el.id = "already";
			document.body.appendChild(el);
			el.scrollIntoView = vi.fn();

			navigateToSection("already");

			expect(pushStateSpy).not.toHaveBeenCalled();
		});
	});
});
