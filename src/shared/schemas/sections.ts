import { z } from "zod";

// Schema for retrieving a specific section
export const getSectionSchema = {
	sectionId: z.number().describe("TestRail Section ID"),
};

// Schema for retrieving all sections in a project
export const getSectionsSchema = {
	projectId: z.number().describe("TestRail Project ID"),
	suiteId: z
		.number()
		.optional()
		.describe("TestRail Suite ID (optional for single suite projects)"),
	limit: z
		.number()
		.optional()
		.describe(
			"Maximum number of sections to return (default 250, max 250)",
		),
	offset: z
		.number()
		.optional()
		.describe("Number of sections to skip (default 0, for pagination)"),
};

// Schema for adding a section
export const addSectionSchema = {
	projectId: z.number().describe("TestRail Project ID"),
	name: z.string().describe("Section name (required)"),
	description: z.string().optional().describe("Section description"),
	parentId: z.number().optional().describe("Parent section ID"),
	suiteId: z
		.number()
		.optional()
		.describe("Test Suite ID (required for multi-suite projects)"),
};

// Schema for moving a section
export const moveSectionSchema = {
	sectionId: z.number().describe("TestRail Section ID"),
	parentId: z.number().nullable().describe("Parent section ID (null for root)"),
	afterId: z
		.number()
		.nullable()
		.optional()
		.describe("ID of the section to position after"),
};

// Schema for updating a section
export const updateSectionSchema = {
	sectionId: z.number().describe("TestRail Section ID"),
	name: z.string().optional().describe("Section name"),
	description: z.string().optional().describe("Section description"),
};

// Schema for deleting a section
export const deleteSectionSchema = {
	sectionId: z.number().describe("TestRail Section ID"),
	soft: z.boolean().optional().describe("True for soft delete (preview only)"),
};

// Create Zod objects from each schema
export const GetSectionInput = z.object(getSectionSchema);
export const GetSectionsInput = z.object(getSectionsSchema);
export const AddSectionInput = z.object(addSectionSchema);
export const MoveSectionInput = z.object(moveSectionSchema);
export const UpdateSectionInput = z.object(updateSectionSchema);
export const DeleteSectionInput = z.object(deleteSectionSchema);

// Extract input types
export type GetSectionInputType = z.infer<typeof GetSectionInput>;
export type GetSectionsInputType = z.infer<typeof GetSectionsInput>;
export type AddSectionInputType = z.infer<typeof AddSectionInput>;
export type MoveSectionInputType = z.infer<typeof MoveSectionInput>;
export type UpdateSectionInputType = z.infer<typeof UpdateSectionInput>;
export type DeleteSectionInputType = z.infer<typeof DeleteSectionInput>;

// -----------------------------------------------
// Response schema definitions - migrated from types.ts
// -----------------------------------------------

/**
 * TestRail API Response for Section
 */
export const TestRailSectionSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().nullable().optional(),
	suite_id: z.number(),
	parent_id: z.number().nullable().optional(),
	depth: z.number(),
	display_order: z.number(),
});
export type TestRailSection = z.infer<typeof TestRailSectionSchema>;
