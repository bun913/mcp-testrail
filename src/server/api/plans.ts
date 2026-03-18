import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TestRailClient } from "../../client/api/index.js";
import { createSuccessResponse, createErrorResponse } from "./utils.js";
import {
	getPlansSchema,
	addPlanSchema,
	addPlanEntrySchema,
	addRunToPlanEntrySchema,
} from "../../shared/schemas/plans.js";

/**
 * Function to register test plan-related API tools
 * @param server McpServer instance
 * @param testRailClient TestRail client instance
 */
export function registerPlanTools(
	server: McpServer,
	testRailClient: TestRailClient,
): void {
	// Get all test plans for a project
	server.registerTool(
		"getPlans",
		{
			description:
				"Retrieves all test plans for a specified TestRail project / 指定されたTestRailプロジェクトの全テストプランを取得します",
			inputSchema: getPlansSchema,
		},
		async ({ projectId }) => {
			try {
				const plans = await testRailClient.plans.getPlans(projectId);
				const successResponse = createSuccessResponse(
					"Test plans retrieved successfully",
					{
						plans,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching test plans for project ${projectId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Add a new test plan
	server.registerTool(
		"addPlan",
		{
			description:
				"Creates a new test plan in a TestRail project / TestRailプロジェクトに新しいテストプランを作成します",
			inputSchema: {
				projectId: addPlanSchema.shape.projectId,
				name: addPlanSchema.shape.name,
				description: addPlanSchema.shape.description,
				milestoneId: addPlanSchema.shape.milestoneId,
				entries: addPlanSchema.shape.entries,
			},
		},
		async (args) => {
			try {
				const { projectId, ...data } = args;
				const plan = await testRailClient.plans.addPlan(projectId, data);
				const successResponse = createSuccessResponse(
					"Test plan created successfully",
					{
						plan,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error creating test plan in project ${args.projectId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Add a plan entry
	server.registerTool(
		"addPlanEntry",
		{
			description:
				"Adds a new test plan entry to an existing test plan / 既存のテストプランに新しいテストプランエントリーを追加します",
			inputSchema: {
				planId: addPlanEntrySchema.shape.planId,
				suiteId: addPlanEntrySchema.shape.suiteId,
				name: addPlanEntrySchema.shape.name,
				description: addPlanEntrySchema.shape.description,
				assignedtoId: addPlanEntrySchema.shape.assignedtoId,
				includeAll: addPlanEntrySchema.shape.includeAll,
				caseIds: addPlanEntrySchema.shape.caseIds,
				configIds: addPlanEntrySchema.shape.configIds,
				refs: addPlanEntrySchema.shape.refs,
				runs: addPlanEntrySchema.shape.runs,
			},
		},
		async (args) => {
			try {
				const { planId, ...data } = args;
				const entry = await testRailClient.plans.addPlanEntry(planId, data);
				const successResponse = createSuccessResponse(
					"Plan entry added successfully",
					{
						entry,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error adding plan entry to plan ${args.planId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Add a run to plan entry
	server.registerTool(
		"addRunToPlanEntry",
		{
			description:
				"Adds a new test run to an existing plan entry / 既存のプランエントリーに新しいテストランを追加します",
			inputSchema: {
				planId: addRunToPlanEntrySchema.shape.planId,
				entryId: addRunToPlanEntrySchema.shape.entryId,
				configIds: addRunToPlanEntrySchema.shape.configIds,
				description: addRunToPlanEntrySchema.shape.description,
				assignedtoId: addRunToPlanEntrySchema.shape.assignedtoId,
				includeAll: addRunToPlanEntrySchema.shape.includeAll,
				caseIds: addRunToPlanEntrySchema.shape.caseIds,
				refs: addRunToPlanEntrySchema.shape.refs,
			},
		},
		async (args) => {
			try {
				const { planId, entryId, ...data } = args;
				const run = await testRailClient.plans.addRunToPlanEntry(
					planId,
					entryId,
					data,
				);
				const successResponse = createSuccessResponse(
					"Test run added to plan entry successfully",
					{
						run,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error adding run to plan entry ${args.entryId} in plan ${args.planId}`,
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
