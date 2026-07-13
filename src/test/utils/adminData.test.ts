import { afterEach, describe, expect, it, vi } from "vitest";
import {
	AuthError,
	deleteGalleryImage,
	fetchAgenda,
	fetchGallery,
	fetchMembers,
	fetchRedirects,
	fetchTranslations,
	loadData,
	persistData,
	saveAgenda,
	saveMembers,
	saveRedirects,
	saveTranslations,
	uploadGalleryImage,
} from "@/utils/adminData";

const BASE_API = "https://pretband-backend.vercel.app/api";
const MEMBERS_URL = `${BASE_API}/members`;
const AGENDA_URL = `${BASE_API}/agenda`;
const TRANSLATIONS_URL = `${BASE_API}/translations`;
const GALLERY_URL = `${BASE_API}/gallery`;
const REDIRECTS_URL = `${BASE_API}/redirects`;

const STORAGE_KEY = "band_admin_v1";

// Helper: build a fetch mock returning a given status/payload.
function stubFetch(
	status: number,
	payload: unknown = {},
): ReturnType<typeof vi.fn> {
	const fn = vi.fn(async () => ({
		ok: status >= 200 && status < 300,
		status,
		json: async () => payload,
	}));
	vi.stubGlobal("fetch", fn);
	return fn;
}

function getFetchMock(): ReturnType<typeof vi.fn> {
	return globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
}

const sampleData: SiteData = {
	members: { sections: [] },
	agenda: { events: [] },
};

afterEach(() => {
	vi.restoreAllMocks();
	localStorage.clear();
});

describe("loadData / persistData", () => {
	it("returns undefined when nothing is stored", () => {
		expect(loadData()).toBeUndefined();
	});

	it("returns parsed data when valid JSON is stored", () => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
		expect(loadData()).toEqual(sampleData);
	});

	it("returns undefined when stored JSON is corrupt", () => {
		localStorage.setItem(STORAGE_KEY, "{not valid json");
		expect(loadData()).toBeUndefined();
	});

	it("persistData writes serialized data under the storage key", () => {
		persistData(sampleData);
		expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(sampleData));
		// round-trips through loadData
		expect(loadData()).toEqual(sampleData);
	});
});

describe("AuthError", () => {
	it("is an Error with the AuthError name and default message", () => {
		const err = new AuthError();
		expect(err).toBeInstanceOf(Error);
		expect(err).toBeInstanceOf(AuthError);
		expect(err.name).toBe("AuthError");
		expect(err.message).toBe("Unauthorized");
	});

	it("accepts a custom message", () => {
		expect(new AuthError("nope").message).toBe("nope");
	});
});

describe("fetchMembers", () => {
	it("GETs the members URL with an Authorization header when a token is given", async () => {
		const payload = { sections: [] };
		stubFetch(200, payload);
		const result = await fetchMembers("tok123");
		expect(result).toEqual(payload);
		const [url, init] = getFetchMock().mock.calls[0];
		expect(url).toBe(MEMBERS_URL);
		expect(init.headers).toEqual({ Authorization: "Bearer tok123" });
		expect(init.method).toBeUndefined();
	});

	it("omits the Authorization header when no token is given", async () => {
		stubFetch(200, {});
		await fetchMembers();
		const [, init] = getFetchMock().mock.calls[0];
		expect(init.headers).toEqual({});
	});

	it("throws AuthError on 401", async () => {
		stubFetch(401);
		await expect(fetchMembers("t")).rejects.toBeInstanceOf(AuthError);
	});

	it("throws a generic Error on a non-ok non-401 response", async () => {
		stubFetch(500);
		await expect(fetchMembers("t")).rejects.toThrow("Could not fetch members");
	});
});

describe("fetchAgenda", () => {
	it("GETs the agenda URL with Authorization header", async () => {
		const payload = { events: [] };
		stubFetch(200, payload);
		const result = await fetchAgenda("abc");
		expect(result).toEqual(payload);
		const [url, init] = getFetchMock().mock.calls[0];
		expect(url).toBe(AGENDA_URL);
		expect(init.headers).toEqual({ Authorization: "Bearer abc" });
	});

	it("omits Authorization when no token", async () => {
		stubFetch(200, {});
		await fetchAgenda();
		expect(getFetchMock().mock.calls[0][1].headers).toEqual({});
	});

	it("throws AuthError on 401", async () => {
		stubFetch(401);
		await expect(fetchAgenda()).rejects.toBeInstanceOf(AuthError);
	});

	it("throws generic Error on 503", async () => {
		stubFetch(503);
		await expect(fetchAgenda()).rejects.toThrow("Could not fetch agenda");
	});
});

describe("saveMembers", () => {
	const data: Members = { sections: [] };

	it("PUTs to the members URL with JSON body and auth header", async () => {
		stubFetch(200, { ok: true });
		const result = await saveMembers("tok", data);
		expect(result).toEqual({ ok: true });
		const [url, init] = getFetchMock().mock.calls[0];
		expect(url).toBe(MEMBERS_URL);
		expect(init.method).toBe("PUT");
		expect(init.headers).toEqual({
			"Content-Type": "application/json",
			Authorization: "Bearer tok",
		});
		expect(init.body).toBe(JSON.stringify(data));
	});

	it("throws AuthError on 401", async () => {
		stubFetch(401);
		await expect(saveMembers("tok", data)).rejects.toBeInstanceOf(AuthError);
	});

	it("throws generic Error on 400", async () => {
		stubFetch(400);
		await expect(saveMembers("tok", data)).rejects.toThrow(
			"Could not save members",
		);
	});
});

describe("saveAgenda", () => {
	const data: Agenda = { events: [] };

	it("PUTs to the agenda URL with JSON body and auth header", async () => {
		stubFetch(200, { ok: true });
		await saveAgenda("tok", data);
		const [url, init] = getFetchMock().mock.calls[0];
		expect(url).toBe(AGENDA_URL);
		expect(init.method).toBe("PUT");
		expect(init.headers).toEqual({
			"Content-Type": "application/json",
			Authorization: "Bearer tok",
		});
		expect(init.body).toBe(JSON.stringify(data));
	});

	it("throws AuthError on 401", async () => {
		stubFetch(401);
		await expect(saveAgenda("tok", data)).rejects.toBeInstanceOf(AuthError);
	});

	it("throws generic Error on 500", async () => {
		stubFetch(500);
		await expect(saveAgenda("tok", data)).rejects.toThrow(
			"Could not save agenda",
		);
	});
});

describe("fetchRedirects", () => {
	it("GETs the redirects URL with auth header and returns parsed data", async () => {
		const payload: RedirectsData = { redirects: [] };
		stubFetch(200, payload);
		const result = await fetchRedirects("rtok");
		expect(result).toEqual(payload);
		const [url, init] = getFetchMock().mock.calls[0];
		expect(url).toBe(REDIRECTS_URL);
		expect(init.headers).toEqual({ Authorization: "Bearer rtok" });
	});

	it("omits Authorization when no token", async () => {
		stubFetch(200, { redirects: [] });
		await fetchRedirects();
		expect(getFetchMock().mock.calls[0][1].headers).toEqual({});
	});

	it("throws AuthError on 401", async () => {
		stubFetch(401);
		await expect(fetchRedirects()).rejects.toBeInstanceOf(AuthError);
	});

	it("throws generic Error on 502", async () => {
		stubFetch(502);
		await expect(fetchRedirects()).rejects.toThrow("Could not fetch redirects");
	});
});

describe("saveRedirects", () => {
	it("strips read-only fields, PUTs only slug/url/label with auth header", async () => {
		stubFetch(200, { ok: true });
		const data = {
			redirects: [
				{
					slug: "s1",
					url: "https://example.com",
					label: "Label",
					// extraneous read-only fields that must be stripped:
					scans: 42,
					lastScannedAt: "2026-01-01",
				},
			],
		} as unknown as RedirectsData;
		await saveRedirects("tok", data);
		const [url, init] = getFetchMock().mock.calls[0];
		expect(url).toBe(REDIRECTS_URL);
		expect(init.method).toBe("PUT");
		expect(init.headers).toEqual({
			"Content-Type": "application/json",
			Authorization: "Bearer tok",
		});
		expect(JSON.parse(init.body)).toEqual({
			redirects: [{ slug: "s1", url: "https://example.com", label: "Label" }],
		});
	});

	it("throws AuthError on 401", async () => {
		stubFetch(401);
		await expect(
			saveRedirects("tok", { redirects: [] }),
		).rejects.toBeInstanceOf(AuthError);
	});

	it("throws generic Error on 500", async () => {
		stubFetch(500);
		await expect(saveRedirects("tok", { redirects: [] })).rejects.toThrow(
			"Could not save redirects",
		);
	});
});

describe("fetchTranslations", () => {
	it("GETs the translations URL with auth header", async () => {
		const payload = { nl: {}, en: {} };
		stubFetch(200, payload);
		const result = await fetchTranslations("ttok");
		expect(result).toEqual(payload);
		const [url, init] = getFetchMock().mock.calls[0];
		expect(url).toBe(TRANSLATIONS_URL);
		expect(init.headers).toEqual({ Authorization: "Bearer ttok" });
	});

	it("omits Authorization when no token", async () => {
		stubFetch(200, {});
		await fetchTranslations();
		expect(getFetchMock().mock.calls[0][1].headers).toEqual({});
	});

	it("throws AuthError on 401", async () => {
		stubFetch(401);
		await expect(fetchTranslations()).rejects.toBeInstanceOf(AuthError);
	});

	it("throws generic Error on 500", async () => {
		stubFetch(500);
		await expect(fetchTranslations()).rejects.toThrow(
			"Could not fetch translations",
		);
	});
});

describe("saveTranslations", () => {
	const data = { nl: { a: 1 }, en: { b: 2 } };

	it("PUTs to the translations URL with JSON body and auth header", async () => {
		stubFetch(200, { ok: true });
		await saveTranslations("tok", data);
		const [url, init] = getFetchMock().mock.calls[0];
		expect(url).toBe(TRANSLATIONS_URL);
		expect(init.method).toBe("PUT");
		expect(init.headers).toEqual({
			"Content-Type": "application/json",
			Authorization: "Bearer tok",
		});
		expect(init.body).toBe(JSON.stringify(data));
	});

	it("throws AuthError on 401", async () => {
		stubFetch(401);
		await expect(saveTranslations("tok", data)).rejects.toBeInstanceOf(
			AuthError,
		);
	});

	it("throws generic Error on 500", async () => {
		stubFetch(500);
		await expect(saveTranslations("tok", data)).rejects.toThrow(
			"Could not save translations",
		);
	});
});

describe("fetchGallery", () => {
	it("GETs the gallery URL (no auth) and returns the images array", async () => {
		stubFetch(200, { images: ["a.jpg", "b.jpg"] });
		const result = await fetchGallery();
		expect(result).toEqual(["a.jpg", "b.jpg"]);
		const [url, init] = getFetchMock().mock.calls[0];
		expect(url).toBe(GALLERY_URL);
		// No init/headers are passed for the public gallery fetch.
		expect(init).toBeUndefined();
	});

	it("throws generic Error on a non-ok response", async () => {
		stubFetch(500, {});
		await expect(fetchGallery()).rejects.toThrow("Could not fetch gallery");
	});
});

describe("uploadGalleryImage", () => {
	it("POSTs to the gallery URL with encoded body and auth header", async () => {
		stubFetch(200, { url: "https://cdn/img.png" });
		const result = await uploadGalleryImage(
			"tok",
			"img.png",
			"image/png",
			"BASE64DATA",
		);
		expect(result).toEqual({ url: "https://cdn/img.png" });
		const [url, init] = getFetchMock().mock.calls[0];
		expect(url).toBe(GALLERY_URL);
		expect(init.method).toBe("POST");
		expect(init.headers).toEqual({
			"Content-Type": "application/json",
			Authorization: "Bearer tok",
		});
		expect(JSON.parse(init.body)).toEqual({
			filename: "img.png",
			contentType: "image/png",
			content: "BASE64DATA",
		});
	});

	it("throws AuthError on 401", async () => {
		stubFetch(401);
		await expect(
			uploadGalleryImage("tok", "f", "image/png", "x"),
		).rejects.toBeInstanceOf(AuthError);
	});

	it("throws generic Error on 413", async () => {
		stubFetch(413);
		await expect(
			uploadGalleryImage("tok", "f", "image/png", "x"),
		).rejects.toThrow("Could not upload image");
	});
});

describe("deleteGalleryImage", () => {
	it("DELETEs at the gallery URL with the url in the body and auth header", async () => {
		stubFetch(200, { ok: true });
		await deleteGalleryImage("tok", "https://cdn/img.png");
		const [url, init] = getFetchMock().mock.calls[0];
		expect(url).toBe(GALLERY_URL);
		expect(init.method).toBe("DELETE");
		expect(init.headers).toEqual({
			"Content-Type": "application/json",
			Authorization: "Bearer tok",
		});
		expect(JSON.parse(init.body)).toEqual({ url: "https://cdn/img.png" });
	});

	it("throws AuthError on 401", async () => {
		stubFetch(401);
		await expect(deleteGalleryImage("tok", "u")).rejects.toBeInstanceOf(
			AuthError,
		);
	});

	it("throws generic Error on 404", async () => {
		stubFetch(404);
		await expect(deleteGalleryImage("tok", "u")).rejects.toThrow(
			"Could not delete image",
		);
	});
});
