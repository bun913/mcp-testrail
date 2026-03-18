import { AxiosError } from "axios";

/**
 * Handles API errors with better context
 * @param error The error object from catch
 * @param message Optional context message
 * @returns Enhanced error with better context
 */
export function handleApiError(error: unknown, message: string): Error {
	// If it's an Axios error, include TestRail API error body in the message
	// so MCP tool responses show the required field or other API reason.
	if (error instanceof Error) {
		const axiosError = error as AxiosError;
		if (axiosError.response) {
			const status = axiosError.response.status;
			const responseData = axiosError.response.data as Record<string, unknown> | undefined;
			const testRailError =
				responseData && typeof responseData.error === "string"
					? responseData.error
					: undefined;
			const detail = testRailError
				? ` ${testRailError}`
				: ` ${JSON.stringify({ status, data: responseData })}`;
			// Enhance message so tool error response includes TestRail's reason (e.g. required custom field)
			const enhancedMessage = `${message}: Request failed with status code ${status}.${detail}`;
			console.error(enhancedMessage);
			return new Error(enhancedMessage);
		}
		console.error(`${message}: ${error.message}`);
		return error;
	}

	// For non-Error objects, create a new Error
	return new Error(`${message}: ${String(error)}`);
}
