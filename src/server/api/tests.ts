import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TestRailClient } from "../../client/api/index.js";
import { createSuccessResponse, createErrorResponse } from "./utils.js";
import { getTestsSchema, getTestSchema } from "../../shared/schemas/tests.js";
import { z } from "zod";

/**
 * Function to register test-related API tools
 * @param server McpServer instance
 * @param testRailClient TestRail client instance
 */
export function registerTestTools(
	server: McpServer,
	testRailClient: TestRailClient,
): void {
	// Get a specific test case
	server.registerTool(
		"getTests",
		{
			description:
				"Retrieves a list of tests for a test run / テスト実行に含まれるテスト一覧を取得します",
			inputSchema: {
				runId: getTestsSchema.shape.runId,
				limit: z
					.number()
					.min(1)
					.optional()
					.default(50)
					.describe(
						"Number of tests to return per page. If you cannot get all tests, try separating the request into multiple calls",
					),
				offset: z
					.number()
					.optional()
					.default(0)
					.describe("Offset for pagination"),
			},
		},
		async (args, extra) => {
			try {
				const { runId } = args;
				const tests = await testRailClient.tests.getTests(runId);

				// Return full case data for individual case requests
				const successResponse = createSuccessResponse(
					"Tests retrieved successfully",
					{
						tests: tests,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching tests ${args.runId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Get a specific test case
	server.registerTool(
		"getTest",
		{
			description:
				"Retrieves complete details for a single test, including all fields such as status, type, and results / 単一のテストの完全な詳細（ステータス、タイプ、結果などのすべてのフィールドを含む）を取得します",
			inputSchema: {
				testId: getTestSchema.shape.testId,
			},
		},
		async (args, extra) => {
			try {
				const { testId } = args;
				const test = await testRailClient.tests.getTest(testId);

				// Return full case data for individual case requests
				const successResponse = createSuccessResponse(
					"Test retrieved successfully",
					{
						test: test,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching test ${args.testId}`,
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
