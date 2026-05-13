import { AxiosError } from "axios";

/**
 * Paginated list envelope returned by TestRail >= 6.7 endpoints
 * (e.g. get_cases, get_sections, get_tests).
 */
export type PageEnvelope<K extends string, T> = {
	offset: number;
	limit: number;
	size: number;
	_links: { next: string | null; prev: string | null };
} & { [P in K]: T[] };

/**
 * Normalizes a TestRail list response into the modern paginated envelope shape.
 *
 * TestRail returns two different shapes for list endpoints depending on
 * server version and pagination settings:
 *   - Modern (>= 6.7 with pagination): `{ <key>: T[], offset, limit, size, _links }`
 *   - Legacy (< 6.7, or when pagination is disabled): `T[]` (flat array)
 *
 * Without normalization the consumers crash with
 * `Cannot read properties of undefined (reading 'map')` on the legacy shape.
 *
 * @param data Raw axios `response.data` from the list endpoint
 * @param key Envelope key name for the list payload (e.g. "cases", "sections")
 * @param requestedLimit Limit value that was sent in the request
 * @param requestedOffset Offset value that was sent in the request
 */
export function normalizeListResponse<K extends string, T>(
	data: unknown,
	key: K,
	requestedLimit: number,
	requestedOffset: number,
): PageEnvelope<K, T> {
	if (Array.isArray(data)) {
		return {
			[key]: data as T[],
			offset: requestedOffset,
			limit: requestedLimit,
			size: data.length,
			_links: { next: null, prev: null },
		} as PageEnvelope<K, T>;
	}
	return data as PageEnvelope<K, T>;
}

/**
 * Handles API errors with better context
 * @param error The error object from catch
 * @param message Optional context message
 * @returns Enhanced error with better context
 */
export function handleApiError(error: unknown, message: string): Error {
	// If it's an Axios error, we can get more context
	if (error instanceof Error) {
		const axiosError = error as AxiosError;
		if (axiosError.response) {
			const status = axiosError.response.status;
			const responseData = axiosError.response.data;
			console.error(
				`${message}: ${JSON.stringify({ response: { status, data: responseData } })}`,
			);
		} else {
			console.error(`${message}: ${error}`);
		}
		return error;
	}

	// For non-Error objects, create a new Error
	return new Error(`${message}: ${String(error)}`);
}
