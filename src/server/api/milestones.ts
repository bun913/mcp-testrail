import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TestRailClient } from "../../client/api/index.js";
import { createSuccessResponse, createErrorResponse } from "./utils.js";
import { getMilestonesSchema } from "../../shared/schemas/milestones.js";

/**
 * Function to register milestone-related API tools
 * @param server McpServer instance
 * @param testRailClient TestRail client instance
 */
export function registerMilestoneTools(
	server: McpServer,
	testRailClient: TestRailClient,
): void {
	// Get all milestones for a project
	server.registerTool(
		"getMilestones",
		{
			description:
				"Retrieves all milestones for a specified TestRail project / 指定されたTestRailプロジェクトの全マイルストーンを取得します",
			inputSchema: getMilestonesSchema,
		},
		async ({ projectId }) => {
			try {
				const milestones =
					await testRailClient.milestones.getMilestones(projectId);
				const successResponse = createSuccessResponse(
					"Milestones retrieved successfully",
					{
						milestones,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching milestones for project ${projectId}`,
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
