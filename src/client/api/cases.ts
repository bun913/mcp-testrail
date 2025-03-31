import { AxiosResponse } from "axios";
import { BaseTestRailClient } from "./baseClient.js";
import {
	TestRailCase,
	TestRailCaseField,
	TestRailCaseType,
	TestRailCaseHistory,
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
	 * Gets test cases for a specific project, suite, or section
	 * @param projectId The ID of the project
	 * @param suiteId The ID of the test suite
	 * @param filters Optional filter parameters including section_id
	 * @returns Promise with array of test cases
	 */
	async getCases(
		projectId: GetTestCasesInput["projectId"],
		suiteId: number,
		filters?: Record<string, string | number | boolean | null | undefined>,
	): Promise<TestRailCase[]> {
		try {
			const response: AxiosResponse<TestRailCase[]> = await this.client.get(
				`/api/v2/get_cases/${projectId}`,
				{
					params: {
						suite_id: suiteId,
						...filters,
					},
				},
			);
			return response.data;
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
		data: Record<string, unknown>,
	): Promise<TestRailCase> {
		try {
			const response: AxiosResponse<TestRailCase> = await this.client.post(
				`/api/v2/add_case/${sectionId}`,
				data,
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
		data: Record<string, unknown>,
	): Promise<TestRailCase> {
		try {
			const response: AxiosResponse<TestRailCase> = await this.client.post(
				`/api/v2/update_case/${caseId}`,
				data,
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
		suiteId: number | null,
		data: Record<string, unknown>,
		caseIds: UpdateTestCaseInput["caseId"][],
	): Promise<void> {
		try {
			const endpoint = suiteId
				? `/api/v2/update_cases/${projectId}?suite_id=${suiteId}`
				: `/api/v2/update_cases/${projectId}`;

			await this.client.post(endpoint, { ...data, case_ids: caseIds });
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
		suiteId: number | null,
		caseIds: DeleteTestCaseInput["caseId"][],
	): Promise<void> {
		try {
			const endpoint = suiteId
				? `/api/v2/delete_cases/${projectId}?suite_id=${suiteId}`
				: `/api/v2/delete_cases/${projectId}`;

			await this.client.post(endpoint, { case_ids: caseIds });
		} catch (error) {
			throw handleApiError(error, "Failed to delete test cases");
		}
	}
}
