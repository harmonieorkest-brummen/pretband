/**
 * Flattens a nested object into a single-level object with dot-notated keys.
 */
export const flatten = (
	obj: Record<string, unknown>,
	prefix = "",
): Record<string, string> => {
	return Object.keys(obj).reduce((acc: Record<string, string>, k) => {
		const pre = prefix.length ? `${prefix}.` : "";
		const value = obj[k];
		if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			const nested = flatten(value as Record<string, unknown>, pre + k);
			Object.assign(acc, nested);
		} else {
			acc[pre + k] = String(value);
		}
		return acc;
	}, {});
};

/**
 * Unflattens a dot-notated object back into its original nested structure.
 */
export const unflatten = (
	obj: Record<string, string>,
): Record<string, unknown> => {
	const result: Record<string, unknown> = {};
	for (const i in obj) {
		const keys = i.split(".");
		keys.reduce((r: Record<string, unknown>, a, j) => {
			if (!r[a]) {
				r[a] = keys.length - 1 === j ? obj[i] : {};
			}
			return r[a] as Record<string, unknown>;
		}, result);
	}
	return result;
};
