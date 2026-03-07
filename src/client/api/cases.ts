import { AxiosResponse } from "axios";
import { BaseTestRailClient } from "./baseClient.js";
import {
	TestRailCase,
	TestRailCaseField,
	TestRailCaseType,
	TestRailCaseHistory,
	addCaseDataSchema,
	updateCaseDataSchema,
	AddCaseData,
	UpdateCaseData,
} from "../../shared/schemas/cases.js";
import { handleApiError } from "./utils.js";
import {
	GetTestCaseInput,
	GetTestCasesInput,
	AddTestCaseInput,
	UpdateTestCaseInput,
	DeleteTestCaseInput,
	CopyTestCasesToSectionInput,
	MoveTestCasesToSectionInput,
	GetTestCaseHistoryInput,
} from "../../shared/schemas/cases.js";

interface GetCasesParams {
	limit?: number;
	offset?: number;
	[key: string]: string | number | boolean | null | undefined;
}

export class CasesClient extends BaseTestRailClient {
	/**
	 * Gets a specific test case by ID
	 * @param caseId The ID of the test case
	 * @returns Promise with test case details
	 */
	async getCase(caseId: GetTestCaseInput["caseId"]): Promise<TestRailCase> {
		try {
			const response: AxiosResponse<TestRailCase> = await this.client.get(
				`/api/v2/get_case/${caseId}`,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to get test case ${caseId}`);
		}
	}

	/**
	 * Gets test cases for a specific project and suite
	 * @param projectId The ID of the project
	 * @param suiteId The ID of the test suite
	 * @param params Optional parameters including pagination (limit, offset) and other filters
	 * @returns Promise with array of test cases
	 */
	async getCases(
		projectId: GetTestCasesInput["projectId"],
		suiteId: number,
		params?: Partial<GetCasesParams>,
	): Promise<{
		cases: TestRailCase[];
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

			const response: AxiosResponse<{
				cases: TestRailCase[];
				offset: number;
				limit: number;
				size: number;
				_links: { next: string | null; prev: string | null };
			}> = await this.client.get(`/api/v2/get_cases/${projectId}`, {
				params: {
					suite_id: suiteId,
					...defaultParams,
				},
			});
			return {
				cases: response.data.cases,
				offset: response.data.offset,
				limit: response.data.limit,
				size: response.data.size,
				_links: response.data._links,
			};
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to get test cases for project ${projectId}`,
			);
		}
	}

	/**
	 * Adds a new test case to a section
	 * @param sectionId The ID of the section
	 * @param data The test case data
	 * @returns Promise with created test case
	 */
	async addCase(
		sectionId: AddTestCaseInput["sectionId"],
		data: AddCaseData,
	): Promise<TestRailCase> {
		try {
			// Validate data with Zod schema
			const validatedData = addCaseDataSchema.parse(data);

			const response: AxiosResponse<TestRailCase> = await this.client.post(
				`/api/v2/add_case/${sectionId}`,
				validatedData,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to add test case to section ${sectionId}`,
			);
		}
	}

	/**
	 * Updates an existing test case
	 * @param caseId The ID of the test case
	 * @param data The test case data to update
	 * @returns Promise with updated test case
	 */
	async updateCase(
		caseId: UpdateTestCaseInput["caseId"],
		data: UpdateCaseData,
	): Promise<TestRailCase> {
		try {
			// Validate data with Zod schema
			const validatedData = updateCaseDataSchema.parse(data);

			const response: AxiosResponse<TestRailCase> = await this.client.post(
				`/api/v2/update_case/${caseId}`,
				validatedData,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to update test case ${caseId}`);
		}
	}

	/**
	 * Deletes an existing test case
	 * @param caseId The ID of the test case
	 */
	async deleteCase(caseId: DeleteTestCaseInput["caseId"]): Promise<void> {
		try {
			await this.client.post(`/api/v2/delete_case/${caseId}`, {});
		} catch (error) {
			throw handleApiError(error, `Failed to delete test case ${caseId}`);
		}
	}

	/**
	 * Gets the history of changes for a specific test case
	 * @param caseId The ID of the test case
	 * @returns Promise with test case history
	 */
	async getCaseHistory(
		caseId: GetTestCaseHistoryInput["caseId"],
	): Promise<TestRailCaseHistory[]> {
		try {
			const response: AxiosResponse<TestRailCaseHistory[]> =
				await this.client.get(`/api/v2/get_history_for_case/${caseId}`);
			return response.data;
		} catch (error) {
			throw handleApiError(error, "Failed to get test case history");
		}
	}

	/**
	 * Gets all available test case types
	 * @returns Promise with array of case types
	 */
	async getCaseTypes(): Promise<TestRailCaseType[]> {
		try {
			const response: AxiosResponse<TestRailCaseType[]> = await this.client.get(
				"/api/v2/get_case_types",
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, "Failed to get case types");
		}
	}

	/**
	 * Gets all available test case fields
	 * @returns Promise with array of case fields
	 */
	async getCaseFields(): Promise<TestRailCaseField[]> {
		try {
			const response: AxiosResponse<TestRailCaseField[]> =
				await this.client.get("/api/v2/get_case_fields");
			return response.data;
		} catch (error) {
			throw handleApiError(error, "Failed to get case fields");
		}
	}

	/**
	 * Copies test cases to a different section
	 * @param caseIds Array of test case IDs to copy
	 * @param sectionId The ID of the target section
	 * @returns Promise with status
	 */
	async copyToSection(
		caseIds: CopyTestCasesToSectionInput["caseIds"],
		sectionId: CopyTestCasesToSectionInput["sectionId"],
	): Promise<{ status: boolean }> {
		try {
			const data = {
				case_ids: caseIds,
			};
			const response: AxiosResponse<{ status: boolean }> =
				await this.client.post(
					`/api/v2/copy_cases_to_section/${sectionId}`,
					data,
				);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to copy test cases to section ${sectionId}`,
			);
		}
	}

	/**
	 * Moves test cases to a different section
	 * @param caseIds Array of test case IDs to move
	 * @param sectionId The ID of the target section
	 * @returns Promise with status
	 */
	async moveToSection(
		caseIds: MoveTestCasesToSectionInput["caseIds"],
		sectionId: MoveTestCasesToSectionInput["sectionId"],
	): Promise<{ status: boolean }> {
		try {
			const data = {
				case_ids: caseIds,
			};
			const response: AxiosResponse<{ status: boolean }> =
				await this.client.post(
					`/api/v2/move_cases_to_section/${sectionId}`,
					data,
				);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to move test cases to section ${sectionId}`,
			);
		}
	}

	/**
	 * Updates multiple test cases at once
	 * @param projectId The ID of the project
	 * @param suiteId Optional ID of the test suite
	 * @param data Data to update on the test cases
	 * @param caseIds Array of test case IDs to update
	 */
	async updateCases(
		projectId: GetTestCasesInput["projectId"],
		suiteId: number,
		data: UpdateCaseData,
		caseIds: UpdateTestCaseInput["caseId"][],
	): Promise<void> {
		try {
			// Validate data with Zod schema
			const validatedData = updateCaseDataSchema.parse(data);

			const endpoint = `/api/v2/update_cases/${projectId}?suite_id=${suiteId}`;
			await this.client.post(endpoint, { ...validatedData, case_ids: caseIds });
		} catch (error) {
			throw handleApiError(error, "Failed to update test cases");
		}
	}

	/**
	 * Deletes multiple test cases at once
	 * @param projectId The ID of the project
	 * @param suiteId Optional ID of the test suite
	 * @param caseIds Array of test case IDs to delete
	 */
	async deleteCases(
		projectId: GetTestCasesInput["projectId"],
		suiteId: number,
		caseIds: DeleteTestCaseInput["caseId"][],
	): Promise<void> {
		try {
			const endpoint = `/api/v2/delete_cases/${projectId}?suite_id=${suiteId}`;
			await this.client.post(endpoint, { case_ids: caseIds });
		} catch (error) {
			throw handleApiError(error, "Failed to delete test cases");
		}
	}

	/**
	 * Imports a .feature file (Gherkin BDD scenario) into a TestRail section.
	 * Uses the dedicated add_bdd endpoint which is the only way to populate
	 * the custom_testrail_bdd_scenario field.
	 * @param sectionId The ID of the section
	 * @param featureContent Raw Gherkin .feature file content
	 * @returns Promise with created/updated test case
	 */
	async addBdd(sectionId: number, featureContent: string) {
		try {
			const FormData = (await import("form-data")).default;
			const form = new FormData();
			form.append("attachment", Buffer.from(featureContent, "utf-8"), {
				filename: "scenario.feature",
				contentType: "text/plain",
			});
			const response = await this.client.post(
				`/api/v2/add_bdd/${sectionId}`,
				form,
				{ headers: form.getHeaders() },
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to import BDD scenario to section ${sectionId}`,
			);
		}
	}

	/**
	 * Exports a BDD test case as a .feature file (Gherkin format).
	 * @param caseId The ID of the test case
	 * @returns Promise with raw Gherkin .feature content as string
	 */
	async getBdd(caseId: number) {
		try {
			const response = await this.client.get(`/api/v2/get_bdd/${caseId}`);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to export BDD scenario for case ${caseId}`,
			);
		}
	}
}
