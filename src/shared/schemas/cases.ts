import { z } from "zod";

// Schema for retrieving a specific test case
export const getTestCaseSchema = z.object({
	caseId: z.number().describe("TestRail Case ID"),
});

// Schema for retrieving all test cases in a project
export const getTestCasesSchema = z.object({
	projectId: z.number().describe("TestRail Project ID"),
	suiteId: z.number().describe("TestRail Suite ID"),
});

// Schema for adding a test case
export const addTestCaseSchema = z.object({
	sectionId: z.number().describe("TestRail Section ID"),
	title: z.string().describe("Test case title"),
	typeId: z.number().optional().describe("Test case type ID"),
	priorityId: z.number().optional().describe("Test case priority ID"),
	estimate: z.string().optional().describe("Test case estimated time"),
	milestoneId: z.number().optional().describe("TestRail Milestone ID"),
	refs: z.string().optional().describe("Test case references"),
	customPrerequisites: z.string().optional().describe("Prerequisites"),
	customSteps: z.string().optional().describe("Test case steps"),
	customExpected: z.string().optional().describe("Expected results"),
});

// Schema for updating a test case
export const updateTestCaseSchema = z.object({
	caseId: z.number().describe("TestRail Case ID"),
	title: z.string().optional().describe("Test case title"),
	typeId: z.number().optional().describe("Test case type ID"),
	priorityId: z.number().optional().describe("Test case priority ID"),
	estimate: z.string().optional().describe("Test case estimated time"),
	milestoneId: z.number().optional().describe("TestRail Milestone ID"),
	refs: z.string().optional().describe("Test case references"),
	customPrerequisites: z.string().optional().describe("Prerequisites"),
	customSteps: z.string().optional().describe("Test case steps"),
	customExpected: z.string().optional().describe("Expected results"),
});

// Schema for deleting a test case
export const deleteTestCaseSchema = z.object({
	caseId: z.number().describe("TestRail Case ID"),
});

// Schema for retrieving test case types
export const getTestCaseTypesSchema = z.object({});

// Schema for retrieving test case fields
export const getTestCaseFieldsSchema = z.object({});

// Schema for copying test cases to a section
export const copyTestCasesToSectionSchema = z.object({
	caseIds: z.array(z.number()).describe("Array of TestRail Case IDs"),
	sectionId: z.number().describe("Target TestRail Section ID"),
});

// Schema for moving test cases to a section
export const moveTestCasesToSectionSchema = z.object({
	caseIds: z.array(z.number()).describe("Array of TestRail Case IDs"),
	sectionId: z.number().describe("Target TestRail Section ID"),
});

// Schema for retrieving test case history
export const getTestCaseHistorySchema = z.object({
	caseId: z.number().describe("TestRail Case ID"),
});

// Schema for updating multiple test cases
export const updateTestCasesSchema = z.object({
	projectId: z.number().describe("TestRail Project ID"),
	suiteId: z.number().describe("TestRail Suite ID"),
	caseIds: z.array(z.number()).describe("Array of TestRail Case IDs"),
	title: z.string().optional().describe("Test case title"),
	typeId: z.number().optional().describe("Test case type ID"),
	priorityId: z.number().optional().describe("Test case priority ID"),
	estimate: z.string().optional().describe("Test case estimated time"),
	milestoneId: z.number().optional().describe("TestRail Milestone ID"),
	refs: z.string().optional().describe("Test case references"),
	customPrerequisites: z.string().optional().describe("Prerequisites"),
	customSteps: z.string().optional().describe("Test case steps"),
	customExpected: z.string().optional().describe("Expected results"),
});

// Create Zod objects from each schema
export const getTestCaseInputSchema = getTestCaseSchema;
export const getTestCasesInputSchema = getTestCasesSchema;
export const addTestCaseInputSchema = addTestCaseSchema;
export const updateTestCaseInputSchema = updateTestCaseSchema;
export const deleteTestCaseInputSchema = deleteTestCaseSchema;
export const getTestCaseTypesInputSchema = getTestCaseTypesSchema;
export const getTestCaseFieldsInputSchema = getTestCaseFieldsSchema;
export const copyTestCasesToSectionInputSchema = copyTestCasesToSectionSchema;
export const moveTestCasesToSectionInputSchema = moveTestCasesToSectionSchema;
export const getTestCaseHistoryInputSchema = getTestCaseHistorySchema;
export const updateTestCasesInputSchema = updateTestCasesSchema;

// Extract input types
export type GetTestCaseInput = z.infer<typeof getTestCaseInputSchema>;
export type GetTestCasesInput = z.infer<typeof getTestCasesInputSchema>;
export type AddTestCaseInput = z.infer<typeof addTestCaseInputSchema>;
export type UpdateTestCaseInput = z.infer<typeof updateTestCaseInputSchema>;
export type DeleteTestCaseInput = z.infer<typeof deleteTestCaseInputSchema>;
export type GetTestCaseTypesInput = z.infer<typeof getTestCaseTypesInputSchema>;
export type GetTestCaseFieldsInput = z.infer<
	typeof getTestCaseFieldsInputSchema
>;
export type CopyTestCasesToSectionInput = z.infer<
	typeof copyTestCasesToSectionInputSchema
>;
export type MoveTestCasesToSectionInput = z.infer<
	typeof moveTestCasesToSectionInputSchema
>;
export type GetTestCaseHistoryInput = z.infer<
	typeof getTestCaseHistoryInputSchema
>;
export type UpdateTestCasesInput = z.infer<typeof updateTestCasesInputSchema>;

// -----------------------------------------------
// Response schema definitions migrated from types.ts
// -----------------------------------------------

/**
 * TestRail API Response for Step
 */
export const TestRailStepSchema = z.object({
	content: z.string(),
	expected: z.string(),
});
export type TestRailStep = z.infer<typeof TestRailStepSchema>;

/**
 * TestRail API Response for Case
 */
export const TestRailCaseSchema = z.object({
	id: z.number(),
	title: z.string(),
	section_id: z.number(),
	template_id: z.number(),
	type_id: z.number(),
	priority_id: z.number(),
	milestone_id: z.number().nullable(),
	refs: z.string().nullable(),
	created_by: z.number(),
	created_on: z.number(),
	updated_by: z.number().nullable(),
	updated_on: z.number().nullable(),
	estimate: z.string().nullable(),
	estimate_forecast: z.string().nullable(),
	suite_id: z.number(),
	display_order: z.number(),
	is_deleted: z.boolean().default(false).optional(),
	status_id: z.number().optional(),
	custom_preconds: z.string().nullable().optional(),
	custom_steps: z.string().nullable().optional(),
	custom_expected: z.string().nullable().optional(),
});
export type TestRailCase = z.infer<typeof TestRailCaseSchema>;

/**
 * TestRail API Response for Case Type
 */
export const TestRailCaseTypeSchema = z.object({
	id: z.number(),
	name: z.string(),
	is_default: z.boolean(),
});
export type TestRailCaseType = z.infer<typeof TestRailCaseTypeSchema>;

/**
 * TestRail API Response for Case Field Config
 */
export const TestRailCaseFieldConfigSchema = z.object({
	id: z.string(),
	context: z.object({
		is_global: z.boolean(),
		project_ids: z.array(z.number()),
	}),
	options: z.object({
		default_value: z.string(),
		format: z.string(),
		is_required: z.boolean(),
		rows: z.string(),
		items: z.string(),
	}),
});
export type TestRailCaseFieldConfig = z.infer<
	typeof TestRailCaseFieldConfigSchema
>;

/**
 * TestRail API Response for Case Field
 */
export const TestRailCaseFieldSchema = z.object({
	id: z.number(),
	type_id: z.number(),
	name: z.string(),
	system_name: z.string(),
	label: z.string(),
	description: z.string(),
	configs: z.array(TestRailCaseFieldConfigSchema),
	display_order: z.number(),
	include_all: z.boolean(),
	template_ids: z.array(z.number()),
	is_active: z.boolean(),
	status_id: z.number(),
});
export type TestRailCaseField = z.infer<typeof TestRailCaseFieldSchema>;

/**
 * TestRail API Response for Case History
 */
export const TestRailCaseHistorySchema = z.object({
	id: z.number(),
	case_id: z.number(),
	user_id: z.number(),
	timestamp: z.number(),
	changes: z.array(
		z.object({
			field: z.string(),
			old_value: z.string().nullable(),
			new_value: z.string().nullable(),
		}),
	),
});
export type TestRailCaseHistory = z.infer<typeof TestRailCaseHistorySchema>;
