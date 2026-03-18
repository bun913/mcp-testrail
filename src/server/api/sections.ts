import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TestRailClient } from "../../client/api/index.js";
import { createSuccessResponse, createErrorResponse } from "./utils.js";
import {
	getSectionSchema,
	getSectionsSchema,
	addSectionSchema,
	moveSectionSchema,
	updateSectionSchema,
	deleteSectionSchema,
} from "../../shared/schemas/sections.js";

/**
 * Function to register section-related API tools
 * @param server McpServer instance
 * @param testRailClient TestRail client instance
 */
export function registerSectionTools(
	server: McpServer,
	testRailClient: TestRailClient,
): void {
	// Get a specific section
	server.tool(
		"getSection",
		"Retrieves details of a specific section by ID / 特定のセクションの詳細をIDで取得します",
		getSectionSchema,
		async ({ sectionId }) => {
			try {
				const section = await testRailClient.sections.getSection(sectionId);
				const successResponse = createSuccessResponse(
					"Section retrieved successfully",
					{
						section,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching section ${sectionId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Get sections for a project or suite with pagination
	server.tool(
		"getSections",
		"Retrieves sections for a specified project and suite. Supports pagination via limit and offset parameters (default: limit=250, offset=0). Use _links.next to determine if more pages are available. / 指定されたプロジェクトとスイートのセクションを取得します。limitとoffsetパラメータでページネーションをサポートします。",
		getSectionsSchema,
		async ({ projectId, suiteId, limit, offset }) => {
			try {
				const params: { limit?: number; offset?: number } = {};
				if (limit !== undefined) params.limit = limit;
				if (offset !== undefined) params.offset = offset;

				const result = await testRailClient.sections.getSections(
					projectId,
					suiteId,
					params,
				);
				const successResponse = createSuccessResponse(
					"Sections retrieved successfully",
					{
						sections: result.sections,
						offset: result.offset,
						limit: result.limit,
						size: result.size,
						_links: result._links,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching sections for project ${projectId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Create a new section
	server.tool(
		"addSection",
		"Creates a new section in a TestRail project / TestRailプロジェクトに新しいセクションを作成します",
		addSectionSchema,
		async ({ projectId, name, description, suiteId, parentId }) => {
			try {
				const data = {
					name,
					description,
					suite_id: suiteId,
					parent_id: parentId,
				};

				const section = await testRailClient.sections.addSection(
					projectId,
					data,
				);
				const successResponse = createSuccessResponse(
					"Section created successfully",
					{
						section,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					"Error creating section",
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Move a section
	server.tool(
		"moveSection",
		"Moves a section to a new position in the test hierarchy / テスト階層内の新しい位置にセクションを移動します",
		moveSectionSchema,
		async ({ sectionId, parentId, afterId }) => {
			try {
				const moveData: {
					parent_id?: number | null;
					after_id?: number | null;
				} = {};

				if (parentId !== undefined) moveData.parent_id = parentId;
				if (afterId !== undefined) moveData.after_id = afterId;

				const section = await testRailClient.sections.moveSection(
					sectionId,
					moveData,
				);
				const successResponse = createSuccessResponse(
					"Section moved successfully",
					{
						section,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error moving section ${sectionId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Update a section
	server.tool(
		"updateSection",
		"Updates an existing section / 既存のセクションを更新します",
		updateSectionSchema,
		async ({ sectionId, name, description }) => {
			try {
				const updateData: { name?: string; description?: string } = {};
				if (name) updateData.name = name;
				if (description) updateData.description = description;

				const section = await testRailClient.sections.updateSection(
					sectionId,
					updateData,
				);
				const successResponse = createSuccessResponse(
					"Section updated successfully",
					{
						section,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error updating section ${sectionId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Delete a section
	server.tool(
		"deleteSection",
		"Deletes a section / セクションを削除します",
		deleteSectionSchema,
		async ({ sectionId, soft }) => {
			try {
				await testRailClient.sections.deleteSection(sectionId, soft);
				const successResponse = createSuccessResponse(
					`Section ${sectionId} deleted successfully`,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error deleting section ${sectionId}`,
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
