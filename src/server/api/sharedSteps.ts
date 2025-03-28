import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TestRailClient } from "../../client/api/index.js";
import { createSuccessResponse, createErrorResponse } from "./utils.js";
import {
	addSharedStepSchema,
	deleteSharedStepSchema,
	getSharedStepSchema,
	getSharedStepsSchema,
	updateSharedStepSchema,
} from "../../shared/schemas/sharedSteps.js";

/**
 * 共有ステップ関連のAPIツールを登録する関数
 * @param server McpServerインスタンス
 * @param testRailClient TestRailクライアントインスタンス
 */
export function registerSharedStepTools(
	server: McpServer,
	testRailClient: TestRailClient,
): void {
	// 共有ステップ取得
	server.tool(
		"getSharedStep",
		getSharedStepSchema,
		async ({ sharedStepId }) => {
			try {
				const sharedStep =
					await testRailClient.sharedSteps.getSharedStep(sharedStepId);
				const successResponse = createSuccessResponse(
					"Shared step retrieved successfully",
					{
						sharedStep,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching shared step ${sharedStepId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// プロジェクトの共有ステップ一覧取得
	server.tool(
		"getSharedSteps",
		getSharedStepsSchema,
		async ({ projectId, ...filters }) => {
			try {
				const sharedSteps = await testRailClient.sharedSteps.getSharedSteps(
					projectId,
					filters,
				);
				const successResponse = createSuccessResponse(
					"Shared steps retrieved successfully",
					{
						sharedSteps,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching shared steps for project ${projectId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// 共有ステップ作成
	server.tool(
		"addSharedStep",
		addSharedStepSchema,
		async ({ projectId, title, steps }) => {
			try {
				const custom_steps_separated = steps.map((step) => ({
					content: step.content,
					expected: step.expected || null,
					additional_info: step.additionalInfo || null,
					refs: step.refs || null,
				}));

				const sharedStep = await testRailClient.sharedSteps.addSharedStep(
					projectId,
					{
						title,
						custom_steps_separated,
					},
				);

				const successResponse = createSuccessResponse(
					"Shared step added successfully",
					{
						sharedStep,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error adding shared step to project ${projectId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// 共有ステップ更新
	server.tool(
		"updateSharedStep",
		updateSharedStepSchema,
		async ({ sharedStepId, title, steps }) => {
			try {
				const data: Record<string, unknown> = {};

				if (title) {
					data.title = title;
				}

				if (steps) {
					const custom_steps_separated = steps.map((step) => ({
						content: step.content,
						expected: step.expected || null,
						additional_info: step.additionalInfo || null,
						refs: step.refs || null,
					}));
					data.custom_steps_separated = custom_steps_separated;
				}

				const sharedStep = await testRailClient.sharedSteps.updateSharedStep(
					sharedStepId,
					data,
				);

				const successResponse = createSuccessResponse(
					"Shared step updated successfully",
					{
						sharedStep,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error updating shared step ${sharedStepId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// 共有ステップ削除
	server.tool(
		"deleteSharedStep",
		deleteSharedStepSchema,
		async ({ sharedStepId, keepInCases = true }) => {
			try {
				await testRailClient.sharedSteps.deleteSharedStep(
					sharedStepId,
					keepInCases,
				);
				const successResponse = createSuccessResponse(
					"Shared step deleted successfully",
					{
						sharedStepId,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error deleting shared step ${sharedStepId}`,
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
