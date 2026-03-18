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
	getRequiredCaseFieldsSchema,
	copyTestCasesToSectionSchema,
	moveTestCasesToSectionSchema,
	getTestCaseHistorySchema,
	updateTestCasesSchema,
	TestRailCase,
	TestRailCaseSchema,
	addBddSchema,
	getBddSchema,
} from "../../shared/schemas/cases.js";

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
	server.registerTool(
		"getCase",
		{
			description:
				"Retrieves complete details for a single test case including steps, expected results, and prerequisites. REQUIRED: caseId.",
			inputSchema: {
				caseId: getTestCaseSchema.shape.caseId,
			},
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
	server.registerTool(
		"getCases",
		{
			description:
				"Retrieves test cases list with basic fields only (excludes steps/expected results for performance). REQUIRED: projectId, suiteId. OPTIONAL: createdBy, filter, limit (default 50), milestoneId, offset (default 0), priorityId, refs, sectionId, templateId, typeId, updatedBy, labelId. Use getCase for full details.",
			inputSchema: {
				projectId: getTestCasesSchema.shape.projectId,
				suiteId: getTestCasesSchema.shape.suiteId,
				createdBy: getTestCasesSchema.shape.createdBy,
				filter: getTestCasesSchema.shape.filter,
				limit: getTestCasesSchema.shape.limit,
				milestoneId: getTestCasesSchema.shape.milestoneId,
				offset: getTestCasesSchema.shape.offset,
				priorityId: getTestCasesSchema.shape.priorityId,
				refs: getTestCasesSchema.shape.refs,
				sectionId: getTestCasesSchema.shape.sectionId,
				templateId: getTestCasesSchema.shape.templateId,
				typeId: getTestCasesSchema.shape.typeId,
				updatedBy: getTestCasesSchema.shape.updatedBy,
				labelId: getTestCasesSchema.shape.labelId,
			},
		},
		async (args, extra) => {
			try {
				const {
					projectId,
					suiteId,
					createdBy,
					filter,
					limit = 50,
					milestoneId,
					offset = 0,
					priorityId,
					refs,
					sectionId,
					templateId,
					typeId,
					updatedBy,
					labelId,
				} = args;

				// Build params object with clean direct parameter mapping
				const params = {
					limit,
					offset,
					created_by: createdBy?.join(","),
					filter,
					milestone_id: milestoneId?.join(","),
					priority_id: priorityId?.join(","),
					refs,
					section_id: sectionId,
					template_id: templateId?.join(","),
					type_id: typeId?.join(","),
					updated_by: updatedBy?.join(","),
					label_id: labelId?.join(","),
				};

				const testCases = await testRailClient.cases.getCases(
					projectId,
					suiteId,
					params,
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
	server.registerTool(
		"addCase",
		{
			description:
				"Creates a new test case in TestRail. REQUIRED: sectionId, title. OPTIONAL: typeId, priorityId, templateId, customSteps, customExpected, customStepsSeparated, customFields, etc. If you get HTTP 400, required custom fields are likely missing: call getCaseFields or getRequiredCaseFields to list them, then pass values in customFields (e.g. { custom_automation_type: 'value' }). Use getCaseTypes for valid typeId. templateId=2 is required for customStepsSeparated.",
			inputSchema: {
				sectionId: addTestCaseSchema.shape.sectionId,
				title: addTestCaseSchema.shape.title,
				typeId: addTestCaseSchema.shape.typeId,
				priorityId: addTestCaseSchema.shape.priorityId,
				estimate: addTestCaseSchema.shape.estimate,
				milestoneId: addTestCaseSchema.shape.milestoneId,
				refs: addTestCaseSchema.shape.refs,
				templateId: addTestCaseSchema.shape.templateId,
				customPrerequisites: addTestCaseSchema.shape.customPrerequisites,
				customSteps: addTestCaseSchema.shape.customSteps,
				customExpected: addTestCaseSchema.shape.customExpected,
				customStepsSeparated: addTestCaseSchema.shape.customStepsSeparated,
				customFields: addTestCaseSchema.shape.customFields,
			},
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
					templateId,
					customPrerequisites,
					customSteps,
					customExpected,
					customStepsSeparated,
					customFields,
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

				// Add template ID if specified
				if (templateId) {
					data.template_id = templateId;
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
				if (customStepsSeparated) {
					data.custom_steps_separated = customStepsSeparated;
				}

				// Add additional custom fields from customFields object
				if (customFields) {
					for (const [key, value] of Object.entries(customFields)) {
						data[key] = value;
					}
				}

				// Remove empty, undefined, null fields to avoid API errors
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
	server.registerTool(
		"updateCase",
		{
			description:
				"Updates an existing test case. REQUIRED: caseId. OPTIONAL: title, typeId, priorityId, templateId, customSteps, customExpected, customStepsSeparated, customFields, etc. Only specified fields will be updated. NOTE: templateId=2 is required to use customStepsSeparated (array of step objects with 'content' and 'expected' fields). For simple text steps, use customSteps and customExpected instead. Use customFields for any additional custom fields (e.g., {custom_case_security_score: 'high'}).",
			inputSchema: {
				caseId: updateTestCaseSchema.shape.caseId,
				title: updateTestCaseSchema.shape.title,
				typeId: updateTestCaseSchema.shape.typeId,
				priorityId: updateTestCaseSchema.shape.priorityId,
				estimate: updateTestCaseSchema.shape.estimate,
				milestoneId: updateTestCaseSchema.shape.milestoneId,
				refs: updateTestCaseSchema.shape.refs,
				templateId: updateTestCaseSchema.shape.templateId,
				customPrerequisites: updateTestCaseSchema.shape.customPrerequisites,
				customSteps: updateTestCaseSchema.shape.customSteps,
				customExpected: updateTestCaseSchema.shape.customExpected,
				customStepsSeparated: updateTestCaseSchema.shape.customStepsSeparated,
				customFields: updateTestCaseSchema.shape.customFields,
			},
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
					templateId,
					customPrerequisites,
					customSteps,
					customExpected,
					customStepsSeparated,
					customFields,
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

				// Add template ID if specified
				if (templateId) {
					data.template_id = templateId;
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
				if (customStepsSeparated) {
					data.custom_steps_separated = customStepsSeparated;
				}

				// Add additional custom fields from customFields object
				if (customFields) {
					for (const [key, value] of Object.entries(customFields)) {
						data[key] = value;
					}
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
	server.registerTool(
		"deleteCase",
		{
			description:
				"Deletes a test case from TestRail / TestRailからテストケースを削除します",
			inputSchema: { caseId: deleteTestCaseSchema.shape.caseId },
		},
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
	server.registerTool(
		"getCaseTypes",
		{
			description:
				"Retrieves all available test case types in TestRail / TestRailで利用可能な全テストケースタイプを取得します",
			inputSchema: {},
		},
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
	server.registerTool(
		"getCaseFields",
		{
			description:
				"Retrieves all case fields (standard + custom) in TestRail. Use before addCase to avoid HTTP 400: response includes configs[].options.is_required so you can see which custom fields are mandatory. Pass required custom field values in addCase's customFields (e.g. { custom_automation_type: 'value' }).",
			inputSchema: {},
		},
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

	// Get only required case fields (for addCase / updateCase)
	server.registerTool(
		"getRequiredCaseFields",
		{
			description:
				"Returns only case fields that are required when creating/updating test cases. Call this before addCase or updateCase to avoid HTTP 400 from missing required custom fields. Optional projectId filters to fields required in that project; omit for all required fields. Use the returned system_name as keys in addCase/updateCase customFields (e.g. custom_automation_type).",
			inputSchema: {
				projectId: getRequiredCaseFieldsSchema.shape.projectId,
			},
		},
		async (args, extra) => {
			try {
				const caseFields = await testRailClient.cases.getCaseFields();
				const projectId = args.projectId;
				const required: Array<{
					system_name: string;
					label: string;
					type_id: number;
					default_value: string;
					description: string;
					applies_to_global: boolean;
					project_ids: number[];
				}> = [];
				for (const field of caseFields) {
					for (const config of field.configs) {
						if (!config.options.is_required) continue;
						const isGlobal = config.context.is_global;
						const projectIds = config.context.project_ids ?? [];
						if (projectId !== undefined && !isGlobal && !projectIds.includes(projectId)) {
							continue;
						}
						required.push({
							system_name: field.system_name,
							label: field.label,
							type_id: field.type_id,
							default_value: config.options.default_value ?? "",
							description: field.description ?? "",
							applies_to_global: isGlobal,
							project_ids: projectIds,
						});
						break; // one entry per field
					}
				}
				const successResponse = createSuccessResponse(
					"Required case fields retrieved successfully",
					{ requiredCaseFields: required },
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					"Error fetching required case fields",
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
	server.registerTool(
		"copyToSection",
		{
			description:
				"Copies specified test cases to a target section while keeping the originals / 指定されたテストケースを対象のセクションにコピーし、元のケースは保持します",
			inputSchema: {
				caseIds: copyTestCasesToSectionSchema.shape.caseIds,
				sectionId: copyTestCasesToSectionSchema.shape.sectionId,
			},
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
	server.registerTool(
		"moveToSection",
		{
			description:
				"Moves specified test cases to a target section / 指定されたテストケースを対象のセクションに移動します",
			inputSchema: {
				caseIds: moveTestCasesToSectionSchema.shape.caseIds,
				sectionId: moveTestCasesToSectionSchema.shape.sectionId,
			},
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
	server.registerTool(
		"getCaseHistory",
		{
			description:
				"Retrieves the change history of a test case including updates to fields and custom fields / テストケースの変更履歴（フィールドとカスタムフィールドの更新を含む）を取得します",
			inputSchema: { caseId: getTestCaseHistorySchema.shape.caseId },
		},
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
	server.registerTool(
		"updateCases",
		{
			description:
				"Updates multiple test cases simultaneously with the same field values / 複数のテストケースを同じフィールド値で一括更新します. NOTE: templateId=2 is required to use customStepsSeparated (array of step objects with 'content' and 'expected' fields). For simple text steps, use customSteps and customExpected instead. Use customFields for any additional custom fields (e.g., {custom_case_security_score: 'high'}).",
			inputSchema: {
				projectId: updateTestCasesSchema.shape.projectId,
				suiteId: updateTestCasesSchema.shape.suiteId,
				caseIds: updateTestCasesSchema.shape.caseIds,
				title: updateTestCasesSchema.shape.title,
				typeId: updateTestCasesSchema.shape.typeId,
				priorityId: updateTestCasesSchema.shape.priorityId,
				estimate: updateTestCasesSchema.shape.estimate,
				milestoneId: updateTestCasesSchema.shape.milestoneId,
				refs: updateTestCasesSchema.shape.refs,
				templateId: updateTestCasesSchema.shape.templateId,
				customPrerequisites: updateTestCasesSchema.shape.customPrerequisites,
				customSteps: updateTestCasesSchema.shape.customSteps,
				customExpected: updateTestCasesSchema.shape.customExpected,
				customStepsSeparated: updateTestCasesSchema.shape.customStepsSeparated,
				customFields: updateTestCasesSchema.shape.customFields,
			},
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
					templateId,
					customPrerequisites,
					customSteps,
					customExpected,
					customStepsSeparated,
					customFields,
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

				// Add template ID if specified
				if (templateId) {
					data.template_id = templateId;
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
				if (customStepsSeparated) {
					data.custom_steps_separated = customStepsSeparated;
				}

				// Add additional custom fields from customFields object
				if (customFields) {
					for (const [key, value] of Object.entries(customFields)) {
						data[key] = value;
					}
				}

				// Remove empty, undefined, null fields to avoid API errors
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

	// Import a BDD .feature file into a section
	server.registerTool(
		"addBdd",
		{
			description:
				"Imports/uploads a .feature file (Gherkin BDD scenario) into a TestRail section. Creates a new test case with BDD template (template_id=4) and populates the custom_testrail_bdd_scenario field. REQUIRED: sectionId, featureContent (raw Gherkin text including Feature:, Scenario:, Given/When/Then).",
			inputSchema: {
				sectionId: addBddSchema.shape.sectionId,
				featureContent: addBddSchema.shape.featureContent,
			},
		},
		async (args, extra) => {
			try {
				const { sectionId, featureContent } = args;
				const result = await testRailClient.cases.addBdd(
					sectionId,
					featureContent,
				);
				const successResponse = createSuccessResponse(
					"BDD scenario imported successfully",
					{ case: result },
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error importing BDD scenario to section ${args.sectionId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Export a BDD test case as .feature file
	server.registerTool(
		"getBdd",
		{
			description:
				"Exports a BDD test case as a .feature file in Gherkin format. REQUIRED: caseId.",
			inputSchema: {
				caseId: getBddSchema.shape.caseId,
			},
		},
		async (args, extra) => {
			try {
				const { caseId } = args;
				const result = await testRailClient.cases.getBdd(caseId);
				const successResponse = createSuccessResponse(
					"BDD scenario exported successfully",
					{ featureContent: result },
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error exporting BDD scenario for case ${args.caseId}`,
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
