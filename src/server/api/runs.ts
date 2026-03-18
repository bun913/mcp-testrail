import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TestRailClient } from "../../client/api/index.js";
import { createSuccessResponse, createErrorResponse } from "./utils.js";
import {
	getRunsSchema,
	getRunSchema,
	addRunSchema,
	updateRunSchema,
} from "../../shared/schemas/runs.js";

/**
 * Function to register test run-related API tools
 * @param server McpServer instance
 * @param testRailClient TestRail client instance
 */
export function registerRunTools(
	server: McpServer,
	testRailClient: TestRailClient,
): void {
	// Get all test runs for a project
	server.registerTool(
		"getRuns",
		{
			description:
				"Retrieves all test runs for a specified TestRail project / 指定されたTestRailプロジェクトの全テスト実行を取得します",
			inputSchema: getRunsSchema,
		},
		async ({ projectId, createdBy, ...filters }) => {
			try {
				// Convert createdBy to string format
				const params: Record<
					string,
					string | number | boolean | null | undefined
				> = {
					...filters,
				};

				if (createdBy) {
					params.created_by = createdBy.join(",");
				}

				const runs = await testRailClient.runs.getRuns(projectId, params);
				const successResponse = createSuccessResponse(
					"Test runs retrieved successfully",
					{
						runs,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching test runs for project ${projectId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Get a specific test run
	server.registerTool(
		"getRun",
		{
			description:
				"Retrieves details of a specific test run by ID / 特定のテスト実行の詳細をIDで取得します",
			inputSchema: getRunSchema,
		},
		async ({ runId }) => {
			try {
				const run = await testRailClient.runs.getRun(runId);
				const successResponse = createSuccessResponse(
					"Test run retrieved successfully",
					{
						run,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching test run ${runId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Create a new test run
	server.registerTool(
		"addRun",
		{
			description:
				"Creates a new test run in a TestRail project / TestRailプロジェクトに新しいテスト実行を作成します",
			inputSchema: addRunSchema,
		},
		async ({
			projectId,
			suiteId,
			name,
			description,
			milestoneId,
			assignedtoId,
			includeAll,
			caseIds,
			configIds,
			refs,
		}) => {
			try {
				const data = {
					name,
					suite_id: suiteId,
					description,
					milestone_id: milestoneId,
					assignedto_id: assignedtoId,
					include_all: includeAll,
					case_ids: caseIds,
					config_ids: configIds,
					refs,
				};

				const run = await testRailClient.runs.addRun(projectId, data);
				const successResponse = createSuccessResponse(
					"Test run created successfully",
					{
						run,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error creating test run for project ${projectId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Update an existing test run
	server.registerTool(
		"updateRun",
		{
			description:
				"Updates an existing test run / 既存のテスト実行を更新します",
			inputSchema: updateRunSchema,
		},
		async ({
			runId,
			name,
			description,
			milestoneId,
			assignedtoId,
			includeAll,
			caseIds,
			refs,
		}) => {
			try {
				const data = {
					name,
					description,
					milestone_id: milestoneId,
					assignedto_id: assignedtoId,
					include_all: includeAll,
					case_ids: caseIds,
					refs,
				};

				const run = await testRailClient.runs.updateRun(runId, data);
				const successResponse = createSuccessResponse(
					"Test run updated successfully",
					{
						run,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error updating test run ${runId}`,
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
