import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TestRailClient } from "../../client/api/index.js";
import { createSuccessResponse, createErrorResponse } from "./utils.js";
import {
	getTestCaseSchema,
	getTestCasesSchema,
	addTestCaseSchema,
	updateTestCaseSchema,
	deleteTestCaseSchema,
	getTestCaseTypesSchema,
	getTestCaseFieldsSchema,
	copyTestCasesToSectionSchema,
	moveTestCasesToSectionSchema,
	getTestCaseHistorySchema,
	updateTestCasesSchema,
	TestRailCase,
	TestRailCaseSchema,
} from "../../shared/schemas/cases.js";
import { z } from "zod";

/**
 * Function to register test case-related API tools
 * @param server McpServer instance
 * @param testRailClient TestRail client instance
 */
export function registerCaseTools(
	server: McpServer,
	testRailClient: TestRailClient,
): void {
	// Extract column names from TestRailCase type
	type ColumnName = keyof TestRailCase;
	const availableColumns = Object.keys(
		TestRailCaseSchema.shape,
	) as ColumnName[];

	// Default columns that exclude large text fields
	const defaultColumns: ColumnName[] = [
		"id",
		"title",
		"section_id",
		"template_id",
		"type_id",
		"priority_id",
		"milestone_id",
		"refs",
		"estimate",
		"suite_id",
		"display_order",
		"is_deleted",
		"status_id",
		"updated_on",
		"created_on",
		"created_by",
		"updated_by",
	];

	// Get a specific test case
	server.tool(
		"getCase",
		"Retrieves complete details for a single test case, including all fields such as steps, expected results, and prerequisites.",
		{
			caseId: getTestCaseSchema.shape.caseId,
		},
		async (args, extra) => {
			try {
				const { caseId } = args;
				const testCase = await testRailClient.cases.getCase(caseId);

				// Return full case data for individual case requests
				const successResponse = createSuccessResponse(
					"Test case retrieved successfully",
					{
						case: testCase,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching test case ${args.caseId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Get all test cases for a project
	server.tool(
		"getCases",
		"Retrieves test cases for a project with limited fields to reduce response size. Large text fields (steps, expected results, etc.) are excluded. For complete case details, use getCase with a specific case ID.",
		{
			projectId: getTestCasesSchema.shape.projectId,
			suiteId: getTestCasesSchema.shape.suiteId,
			limit: z
				.number()
				.min(1)
				.optional()
				.default(50)
				.describe(
					"Number of cases to return per page. If you cannot get all cases, try separating the request into multiple calls",
				),
			offset: z
				.number()
				.optional()
				.default(0)
				.describe("Offset for pagination"),
		},
		async (args, extra) => {
			try {
				const {
					projectId,
					suiteId,
					limit = 50,
					offset = 0,
				} = args;
				const testCases = await testRailClient.cases.getCases(
					projectId,
					suiteId,
					{
						suite_id: suiteId,
						limit,
						offset,
					},
				);

				// Always filter to default columns to reduce response size
				const responseData = testCases.cases.map((testCase) => {
					// Always include id
					const filtered: Partial<TestRailCase> = {
						id: testCase.id,
					};

					// Add only the default columns
					for (const column of defaultColumns) {
						if (column in testCase && column !== "id") {
							// Use type assertion more carefully
							(filtered as Record<string, unknown>)[column] = (
								testCase as Record<string, unknown>
							)[column];
						}
					}

					return filtered;
				});

				const successResponse = createSuccessResponse(
					"Test cases retrieved successfully",
					{
						cases: responseData,
						pagination: {
							limit,
							offset,
							total: testCases.size,
							hasMore: testCases._links.next !== null,
						},
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching test cases for project ${args.projectId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Add a new test case
	server.tool(
		"addCase",
		{
			sectionId: addTestCaseSchema.shape.sectionId,
			title: addTestCaseSchema.shape.title,
			typeId: addTestCaseSchema.shape.typeId,
			priorityId: addTestCaseSchema.shape.priorityId,
			estimate: addTestCaseSchema.shape.estimate,
			milestoneId: addTestCaseSchema.shape.milestoneId,
			refs: addTestCaseSchema.shape.refs,
			customPrerequisites: addTestCaseSchema.shape.customPrerequisites,
			customSteps: addTestCaseSchema.shape.customSteps,
			customExpected: addTestCaseSchema.shape.customExpected,
		},
		async (args, extra) => {
			try {
				const {
					sectionId,
					title,
					typeId,
					priorityId,
					estimate,
					milestoneId,
					refs,
					customPrerequisites,
					customSteps,
					customExpected,
				} = args;
				// Build test case data
				const data: Record<string, unknown> = {};

				// Add title if specified
				if (title) {
					data.title = title;
				}

				// Add type ID if specified
				if (typeId) {
					data.type_id = typeId;
				}

				// Add priority ID if specified
				if (priorityId) {
					data.priority_id = priorityId;
				}

				// Add estimate if specified
				if (estimate) {
					data.estimate = estimate;
				}

				// Add milestone ID if specified
				if (milestoneId) {
					data.milestone_id = milestoneId;
				}

				// Add references if specified
				if (refs) {
					data.refs = refs;
				}

				// Remove empty or undefined fields
				for (const key of Object.keys(data)) {
					const value = data[key];
					if (value === undefined || value === null || value === "") {
						delete data[key];
					}
				}

				const testCase = await testRailClient.cases.addCase(sectionId, data);
				const successResponse = createSuccessResponse(
					"Test case created successfully",
					{
						case: testCase,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error creating test case in section ${args.sectionId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Update an existing test case
	server.tool(
		"updateCase",
		{
			caseId: updateTestCaseSchema.shape.caseId,
			title: updateTestCaseSchema.shape.title,
			typeId: updateTestCaseSchema.shape.typeId,
			priorityId: updateTestCaseSchema.shape.priorityId,
			estimate: updateTestCaseSchema.shape.estimate,
			milestoneId: updateTestCaseSchema.shape.milestoneId,
			refs: updateTestCaseSchema.shape.refs,
			customPrerequisites: updateTestCaseSchema.shape.customPrerequisites,
			customSteps: updateTestCaseSchema.shape.customSteps,
			customExpected: updateTestCaseSchema.shape.customExpected,
		},
		async (args, extra) => {
			try {
				const {
					caseId,
					title,
					typeId,
					priorityId,
					estimate,
					milestoneId,
					refs,
					customPrerequisites,
					customSteps,
					customExpected,
				} = args;
				// Build update data
				const data: Record<string, unknown> = {};

				// Add title if specified
				if (title) {
					data.title = title;
				}

				// Add type ID if specified
				if (typeId) {
					data.type_id = typeId;
				}

				// Add priority ID if specified
				if (priorityId) {
					data.priority_id = priorityId;
				}

				// Add estimate if specified
				if (estimate) {
					data.estimate = estimate;
				}

				// Add milestone ID if specified
				if (milestoneId) {
					data.milestone_id = milestoneId;
				}

				// Add references if specified
				if (refs) {
					data.refs = refs;
				}

				const testCase = await testRailClient.cases.updateCase(caseId, data);
				const successResponse = createSuccessResponse(
					"Test case updated successfully",
					{
						case: testCase,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error updating test case ${args.caseId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Delete a test case
	server.tool(
		"deleteCase",
		{ caseId: deleteTestCaseSchema.shape.caseId },
		async (args, extra) => {
			try {
				const { caseId } = args;
				await testRailClient.cases.deleteCase(caseId);
				const successResponse = createSuccessResponse(
					`Test case ${caseId} deleted successfully`,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error deleting test case ${args.caseId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Get all test case types
	server.tool(
		"getCaseTypes",
		"Retrieves all available test case types in TestRail / TestRailで利用可能な全テストケースタイプを取得します",
		{},
		async (args, extra) => {
			try {
				const caseTypes = await testRailClient.cases.getCaseTypes();
				const successResponse = createSuccessResponse(
					"Test case types retrieved successfully",
					{
						caseTypes,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					"Error fetching test case types",
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Get all test case fields
	server.tool(
		"getCaseFields",
		"Retrieves all available test case fields in TestRail / TestRailで利用可能な全テストケースフィールドを取得します",
		{},
		async (args, extra) => {
			try {
				const caseFields = await testRailClient.cases.getCaseFields();
				const successResponse = createSuccessResponse(
					"Test case fields retrieved successfully",
					{
						caseFields,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					"Error fetching test case fields",
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Copy test cases to section
	server.tool(
		"copyToSection",
		{
			caseIds: copyTestCasesToSectionSchema.shape.caseIds,
			sectionId: copyTestCasesToSectionSchema.shape.sectionId,
		},
		async (args, extra) => {
			try {
				const { caseIds, sectionId } = args;
				const result = await testRailClient.cases.copyToSection(
					caseIds,
					sectionId,
				);
				const successResponse = createSuccessResponse(
					"Test cases copied successfully",
					{
						result,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error copying test cases to section ${args.sectionId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Move test cases to section
	server.tool(
		"moveToSection",
		{
			caseIds: moveTestCasesToSectionSchema.shape.caseIds,
			sectionId: moveTestCasesToSectionSchema.shape.sectionId,
		},
		async (args, extra) => {
			try {
				const { caseIds, sectionId } = args;
				const result = await testRailClient.cases.moveToSection(
					caseIds,
					sectionId,
				);
				const successResponse = createSuccessResponse(
					"Test cases moved successfully",
					{
						result,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error moving test cases to section ${args.sectionId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Get test case history
	server.tool(
		"getCaseHistory",
		{ caseId: getTestCaseHistorySchema.shape.caseId },
		async (args, extra) => {
			try {
				const { caseId } = args;
				const history = await testRailClient.cases.getCaseHistory(caseId);
				const successResponse = createSuccessResponse(
					"Test case history retrieved successfully",
					{
						history,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching history for test case ${args.caseId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Update multiple test cases
	server.tool(
		"updateCases",
		{
			projectId: updateTestCasesSchema.shape.projectId,
			suiteId: updateTestCasesSchema.shape.suiteId,
			caseIds: updateTestCasesSchema.shape.caseIds,
			title: updateTestCasesSchema.shape.title,
			typeId: updateTestCasesSchema.shape.typeId,
			priorityId: updateTestCasesSchema.shape.priorityId,
			estimate: updateTestCasesSchema.shape.estimate,
			milestoneId: updateTestCasesSchema.shape.milestoneId,
			refs: updateTestCasesSchema.shape.refs,
			customPrerequisites: updateTestCasesSchema.shape.customPrerequisites,
			customSteps: updateTestCasesSchema.shape.customSteps,
			customExpected: updateTestCasesSchema.shape.customExpected,
		},
		async (args, extra) => {
			try {
				const {
					projectId,
					suiteId,
					caseIds,
					title,
					typeId,
					priorityId,
					estimate,
					milestoneId,
					refs,
					customPrerequisites,
					customSteps,
					customExpected,
				} = args;

				// Build update data
				const data: Record<string, unknown> = {};

				// Add title if specified
				if (title) {
					data.title = title;
				}

				// Add type ID if specified
				if (typeId) {
					data.type_id = typeId;
				}

				// Add priority ID if specified
				if (priorityId) {
					data.priority_id = priorityId;
				}

				// Add estimate if specified
				if (estimate) {
					data.estimate = estimate;
				}

				// Add milestone ID if specified
				if (milestoneId) {
					data.milestone_id = milestoneId;
				}

				// Add references if specified
				if (refs) {
					data.refs = refs;
				}

				// Add custom fields if specified
				if (customPrerequisites) {
					data.custom_preconds = customPrerequisites;
				}
				if (customSteps) {
					data.custom_steps = customSteps;
				}
				if (customExpected) {
					data.custom_expected = customExpected;
				}

				// Remove empty or undefined fields
				for (const key of Object.keys(data)) {
					const value = data[key];
					if (value === undefined || value === null || value === "") {
						delete data[key];
					}
				}

				await testRailClient.cases.updateCases(
					projectId,
					suiteId,
					data,
					caseIds,
				);
				const successResponse = createSuccessResponse(
					"Test cases updated successfully",
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error updating test cases for project ${args.projectId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);
}
