import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TestRailClient } from "../../client/api/index.js";
import { createSuccessResponse, createErrorResponse } from "./utils.js";
import {
	getSuitesSchema,
	getSuiteSchema,
	addSuiteSchema,
	updateSuiteSchema,
} from "../../shared/schemas/suites.js";

/**
 * Function to register test suite-related API tools
 * @param server McpServer instance
 * @param testRailClient TestRail client instance
 */
export function registerSuiteTools(
	server: McpServer,
	testRailClient: TestRailClient,
): void {
	// Get all test suites for a project
	server.registerTool(
		"getSuites",
		{
			description:
				"Retrieves all test suites for a specified TestRail project / 指定されたTestRailプロジェクトの全テストスイートを取得します",
			inputSchema: {
				projectId: getSuitesSchema.shape.projectId.describe(
					"TestRail Project ID to get suites from / スイート一覧を取得するTestRailプロジェクトID",
				),
			},
		},
		async (args, extra) => {
			try {
				const { projectId } = args;
				const suites = await testRailClient.suites.getSuites(projectId);
				const successResponse = createSuccessResponse(
					"Test suites retrieved successfully",
					{
						suites,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching test suites for project ${args.projectId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Get a specific test suite
	server.registerTool(
		"getSuite",
		{
			description:
				"Retrieves details of a specific test suite by ID / 特定のテストスイートの詳細をIDで取得します",
			inputSchema: {
				suiteId: getSuiteSchema.shape.suiteId.describe(
					"TestRail Suite ID to retrieve / 取得するTestRailスイートID",
				),
			},
		},
		async (args, extra) => {
			try {
				const { suiteId } = args;
				const suite = await testRailClient.suites.getSuite(suiteId);
				const successResponse = createSuccessResponse(
					"Test suite retrieved successfully",
					{
						suite,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching test suite ${args.suiteId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Create a new test suite
	server.registerTool(
		"addSuite",
		{
			description:
				"Creates a new test suite in the specified project / 指定されたプロジェクトに新しいテストスイートを作成します",
			inputSchema: {
				projectId: addSuiteSchema.shape.projectId.describe(
					"TestRail Project ID where the suite will be created / スイートを作成するTestRailプロジェクトID",
				),
				name: addSuiteSchema.shape.name.describe(
					"Name of the test suite / テストスイートの名前",
				),
				description: addSuiteSchema.shape.description.describe(
					"Description of the test suite (optional) / テストスイートの説明（任意）",
				),
			},
		},
		async (args, extra) => {
			try {
				const { projectId, name, description } = args;
				const data = {
					name,
					description,
				};
				const suite = await testRailClient.suites.addSuite(projectId, data);
				const successResponse = createSuccessResponse(
					"Test suite created successfully",
					{
						suite,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error creating test suite for project ${args.projectId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Update an existing test suite
	server.registerTool(
		"updateSuite",
		{
			description:
				"Updates an existing test suite / 既存のテストスイートを更新します",
			inputSchema: {
				suiteId: updateSuiteSchema.shape.suiteId.describe(
					"TestRail Suite ID to update / 更新するTestRailスイートID",
				),
				name: updateSuiteSchema.shape.name.describe(
					"New name for the test suite (optional) / テストスイートの新しい名前（任意）",
				),
				description: updateSuiteSchema.shape.description.describe(
					"New description for the test suite (optional) / テストスイートの新しい説明（任意）",
				),
			},
		},
		async (args, extra) => {
			try {
				const { suiteId, name, description } = args;
				const data: { name?: string; description?: string } = {};

				if (name) data.name = name;
				if (description) data.description = description;

				const suite = await testRailClient.suites.updateSuite(suiteId, data);
				const successResponse = createSuccessResponse(
					"Suite updated successfully",
					{
						suite,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error updating suite ${args.suiteId}`,
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
