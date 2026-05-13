import { AxiosResponse } from "axios";
import { BaseTestRailClient } from "./baseClient.js";
import {
	GetTestInput,
	GetTestsInput,
	TestRailTest,
} from "../../shared/schemas/tests.js";
import { handleApiError, normalizeListResponse } from "./utils.js";

interface GetTestsParams {
	limit?: number;
	offset?: number;
	[key: string]: string | number | boolean | null | undefined;
}

export class TestsClient extends BaseTestRailClient {
	/**
	 * Gets a specific test by ID
	 * @param suiteId The ID of the test
	 * @returns Promise with test details
	 */
	async getTest(testId: GetTestInput["testId"]): Promise<TestRailTest> {
		try {
			const response: AxiosResponse<TestRailTest> = await this.client.get(
				`/api/v2/get_test/${testId}`,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to get test ${testId}`);
		}
	}

	/**
	 * Gets all tests for a run
	 * @param runId The ID of the run
	 * @param params Optional parameters including pagination (limit, offset)
	 * @returns Promise with array of tests and pagination metadata
	 */
	async getTests(
		runId: GetTestsInput["runId"],
		params?: Partial<GetTestsParams>,
	): Promise<{
		tests: TestRailTest[];
		offset: number;
		limit: number;
		size: number;
		_links: { next: string | null; prev: string | null };
	}> {
		try {
			const defaultParams = {
				limit: 50,
				offset: 0,
				...params,
			};

			const response: AxiosResponse<unknown> = await this.client.get(
				`/api/v2/get_tests/${runId}`,
				{
					params: defaultParams,
				},
			);

			return normalizeListResponse<"tests", TestRailTest>(
				response.data,
				"tests",
				defaultParams.limit,
				defaultParams.offset,
			);
		} catch (error) {
			throw handleApiError(error, `Failed to get tests for run ${runId}`);
		}
	}
}
