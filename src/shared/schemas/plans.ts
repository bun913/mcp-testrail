import { z } from "zod";
import { TestRailRunSchema } from "./runs.js";

// Schema for retrieving all test plans for a project
export const getPlansSchema = {
	projectId: z.number().describe("TestRail Project ID"),
};

// Schema for adding a new test plan
export const addPlanSchema = z.object({
	projectId: z.number().describe("TestRail Project ID"),
	name: z.string().describe("Test plan name"),
	description: z.string().optional().describe("Test plan description"),
	milestoneId: z.number().optional().describe("Milestone ID"),
	entries: z
		.array(
			z.object({
				suite_id: z.number(),
				name: z.string().optional(),
				description: z.string().optional(),
				assignedto_id: z.number().optional(),
				include_all: z.boolean().optional(),
				case_ids: z.array(z.number()).optional(),
				config_ids: z.array(z.number()).optional(),
				runs: z.array(z.record(z.unknown())).optional(),
			}),
		)
		.optional()
		.describe("Test runs to include in the plan"),
});

// Schema for adding a plan entry
export const addPlanEntrySchema = z.object({
	planId: z.number().describe("TestRail Plan ID"),
	suiteId: z.number().describe("Test suite ID"),
	name: z.string().optional().describe("Plan entry name"),
	description: z.string().optional().describe("Plan entry description"),
	assignedtoId: z.number().optional().describe("User ID to assign to"),
	includeAll: z.boolean().optional().describe("Include all test cases"),
	caseIds: z
		.array(z.number())
		.optional()
		.describe("Specific case IDs to include"),
	configIds: z.array(z.number()).optional().describe("Configuration IDs"),
	refs: z.string().optional().describe("References"),
	runs: z
		.array(z.record(z.unknown()))
		.optional()
		.describe("Test run configurations"),
});

// Schema for adding a run to plan entry
export const addRunToPlanEntrySchema = z.object({
	planId: z.number().describe("TestRail Plan ID"),
	entryId: z.string().describe("Plan Entry ID"),
	configIds: z.array(z.number()).describe("Configuration IDs for the test run"),
	description: z.string().optional().describe("Test run description"),
	assignedtoId: z.number().optional().describe("User ID to assign to"),
	includeAll: z.boolean().optional().describe("Include all test cases"),
	caseIds: z
		.array(z.number())
		.optional()
		.describe("Specific case IDs to include"),
	refs: z.string().optional().describe("References"),
});

// Create Zod objects from each schema
export const GetPlansInput = z.object(getPlansSchema);
export const AddPlanInput = addPlanSchema;
export const AddPlanEntryInput = addPlanEntrySchema;
export const AddRunToPlanEntryInput = addRunToPlanEntrySchema;

// Extract input types
export type GetPlansInputType = z.infer<typeof GetPlansInput>;
export type AddPlanInputType = z.infer<typeof AddPlanInput>;
export type AddPlanEntryInputType = z.infer<typeof AddPlanEntryInput>;
export type AddRunToPlanEntryInputType = z.infer<typeof AddRunToPlanEntryInput>;

/**
 * TestRail API Response for Plan Entry
 */
export const TestRailPlanEntrySchema = z.object({
	id: z.string(),
	suite_id: z.number(),
	name: z.string(),
	description: z.string().nullable().optional(),
	include_all: z.boolean(),
	runs: z.array(TestRailRunSchema),
	refs: z.string().optional(),
});
export type TestRailPlanEntry = z.infer<typeof TestRailPlanEntrySchema>;

/**
 * TestRail API Response for Plan
 */
export const TestRailPlanSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().optional(),
	milestone_id: z.number().nullable().optional(),
	assignedto_id: z.number().nullable().optional(),
	project_id: z.number(),
	created_on: z.number(),
	created_by: z.number(),
	completed_on: z.number().nullable().optional(),
	is_completed: z.boolean(),
	passed_count: z.number(),
	blocked_count: z.number(),
	untested_count: z.number(),
	retest_count: z.number(),
	failed_count: z.number(),
	entries: z.array(TestRailPlanEntrySchema),
	url: z.string(),
});
export type TestRailPlan = z.infer<typeof TestRailPlanSchema>;
