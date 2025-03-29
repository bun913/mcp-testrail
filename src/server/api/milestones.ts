import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TestRailClient } from "../../client/api/index.js";
import { createSuccessResponse, createErrorResponse } from "./utils.js";
import {
	getMilestoneSchema,
	getMilestonesSchema,
	addMilestoneSchema,
	updateMilestoneSchema,
	deleteMilestoneSchema,
} from "../../shared/schemas/milestones.js";

/**
 * Function to register milestone-related API tools
 * @param server McpServer instance
 * @param testRailClient TestRail client instance
 */
export function registerMilestoneTools(
	server: McpServer,
	testRailClient: TestRailClient,
): void {
	// Get a specific milestone
	server.tool("getMilestone", getMilestoneSchema, async ({ milestoneId }) => {
		try {
			const milestone =
				await testRailClient.milestones.getMilestone(milestoneId);
			const successResponse = createSuccessResponse(
				"Milestone retrieved successfully",
				{
					milestone,
				},
			);
			return {
				content: [{ type: "text", text: JSON.stringify(successResponse) }],
			};
		} catch (error) {
			const errorResponse = createErrorResponse(
				`Error fetching milestone ${milestoneId}`,
				error,
			);
			return {
				content: [{ type: "text", text: JSON.stringify(errorResponse) }],
				isError: true,
			};
		}
	});

	// Get all milestones for a project
	server.tool("getMilestones", getMilestonesSchema, async ({ projectId }) => {
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
	});

	// Add a new milestone
	server.tool("addMilestone", addMilestoneSchema, async (milestoneData) => {
		try {
			const { projectId, ...data } = milestoneData;

			const milestone = await testRailClient.milestones.addMilestone(
				projectId,
				data,
			);
			const successResponse = createSuccessResponse(
				"Milestone created successfully",
				{
					milestone,
				},
			);
			return {
				content: [{ type: "text", text: JSON.stringify(successResponse) }],
			};
		} catch (error) {
			const errorResponse = createErrorResponse(
				"Error creating milestone",
				error,
			);
			return {
				content: [{ type: "text", text: JSON.stringify(errorResponse) }],
				isError: true,
			};
		}
	});

	// Update a milestone
	server.tool(
		"updateMilestone",
		updateMilestoneSchema,
		async (milestoneData) => {
			try {
				const { milestoneId, ...data } = milestoneData;

				const milestone = await testRailClient.milestones.updateMilestone(
					milestoneId,
					data,
				);
				const successResponse = createSuccessResponse(
					"Milestone updated successfully",
					{
						milestone,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error updating milestone ${milestoneData.milestoneId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Delete a milestone
	server.tool(
		"deleteMilestone",
		deleteMilestoneSchema,
		async ({ milestoneId }) => {
			try {
				await testRailClient.milestones.deleteMilestone(milestoneId);
				const successResponse = createSuccessResponse(
					"Milestone deleted successfully",
					{},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error deleting milestone ${milestoneId}`,
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
