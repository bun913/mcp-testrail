import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TestRailClient } from "../../client/api/index.js";
import { createSuccessResponse, createErrorResponse } from "./utils.js";
import {
	getResultsSchema,
	getResultsForCaseSchema,
	getResultsForRunSchema,
	addResultSchema,
	addResultForCaseSchema,
	addResultsSchema,
	addResultsForCasesSchema,
} from "../../shared/schemas/results.js";

/**
 * Function to register test result-related API tools
 * @param server McpServer instance
 * @param testRailClient TestRail client instance
 */
export function registerResultTools(
	server: McpServer,
	testRailClient: TestRailClient,
): void {
	// Get test results for a test
	server.tool(
		"getResults",
		getResultsSchema,
		async ({ testId, ...filters }) => {
			try {
				const results = await testRailClient.results.getResults(
					testId,
					filters,
				);
				const successResponse = createSuccessResponse(
					"Results retrieved successfully",
					{
						results,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching results for test ${testId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Get test results for a specific test case in a run
	server.tool(
		"getResultsForCase",
		getResultsForCaseSchema,
		async ({ runId, caseId, ...filters }) => {
			try {
				const results = await testRailClient.results.getResultsForCase(
					runId,
					caseId,
					filters,
				);
				const successResponse = createSuccessResponse(
					"Results retrieved successfully",
					{
						results,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching results for run ${runId} and case ${caseId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Get all test results for a test run
	server.tool(
		"getResultsForRun",
		getResultsForRunSchema,
		async ({ runId, ...filters }) => {
			try {
				const results = await testRailClient.results.getResultsForRun(
					runId,
					filters,
				);
				const successResponse = createSuccessResponse(
					"Results retrieved successfully",
					{
						results,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error fetching results for run ${runId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Add a result for a test
	server.tool(
		"addResult",
		addResultSchema,
		async ({ testId, ...resultData }) => {
			try {
				// Prepare result data
				const data: Record<string, unknown> = {};

				// Add status ID if specified
				if (resultData.statusId) {
					data.status_id = resultData.statusId;
				}

				// Add comment if specified
				if (resultData.comment) {
					data.comment = resultData.comment;
				}

				// Add version if specified
				if (resultData.version) {
					data.version = resultData.version;
				}

				// Add elapsed time if specified
				if (resultData.elapsed) {
					data.elapsed = resultData.elapsed;
				}

				// Add defects if specified
				if (resultData.defects) {
					data.defects = resultData.defects;
				}

				// Add assignee ID if specified
				if (resultData.assignedtoId) {
					data.assignedto_id = resultData.assignedtoId;
				}

				const result = await testRailClient.results.addResult(testId, data);
				const successResponse = createSuccessResponse(
					"Result added successfully",
					{
						result,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error adding result for test ${testId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Add a result for a specific test case in a run
	server.tool(
		"addResultForCase",
		addResultForCaseSchema,
		async ({ runId, caseId, ...resultData }) => {
			try {
				// Prepare result data
				const data: Record<string, unknown> = {};

				// Add status ID if specified
				if (resultData.statusId) {
					data.status_id = resultData.statusId;
				}

				// Add comment if specified
				if (resultData.comment) {
					data.comment = resultData.comment;
				}

				// Add version if specified
				if (resultData.version) {
					data.version = resultData.version;
				}

				// Add elapsed time if specified
				if (resultData.elapsed) {
					data.elapsed = resultData.elapsed;
				}

				// Add defects if specified
				if (resultData.defects) {
					data.defects = resultData.defects;
				}

				// Add assignee ID if specified
				if (resultData.assignedtoId) {
					data.assignedto_id = resultData.assignedtoId;
				}

				const result = await testRailClient.results.addResultForCase(
					runId,
					caseId,
					data,
				);
				const successResponse = createSuccessResponse(
					"Result added successfully",
					{
						result,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error adding result for run ${runId} and case ${caseId}`,
					error,
				);
				return {
					content: [{ type: "text", text: JSON.stringify(errorResponse) }],
					isError: true,
				};
			}
		},
	);

	// Add multiple test results
	server.tool("addResults", addResultsSchema, async ({ runId, results }) => {
		try {
			// Prepare data to send to API
			const data = {
				results: results.map((result) => {
					const resultData: Record<string, unknown> = {
						test_id: result.testId,
					};

					// Add status ID if specified
					if (result.statusId) {
						resultData.status_id = result.statusId;
					}

					// Add comment if specified
					if (result.comment) {
						resultData.comment = result.comment;
					}

					// Add version if specified
					if (result.version) {
						resultData.version = result.version;
					}

					// Add elapsed time if specified
					if (result.elapsed) {
						resultData.elapsed = result.elapsed;
					}

					// Add defects if specified
					if (result.defects) {
						resultData.defects = result.defects;
					}

					// Add assignee ID if specified
					if (result.assignedtoId) {
						resultData.assignedto_id = result.assignedtoId;
					}

					return resultData;
				}),
			};

			const addedResults = await testRailClient.results.addResults(runId, data);
			const successResponse = createSuccessResponse(
				"Results added successfully",
				{
					results: addedResults,
				},
			);
			return {
				content: [{ type: "text", text: JSON.stringify(successResponse) }],
			};
		} catch (error) {
			const errorResponse = createErrorResponse(
				`Error adding results for run ${runId}`,
				error,
			);
			return {
				content: [{ type: "text", text: JSON.stringify(errorResponse) }],
				isError: true,
			};
		}
	});

	// Add results for multiple test cases
	server.tool(
		"addResultsForCases",
		addResultsForCasesSchema,
		async ({ runId, results }) => {
			try {
				// Prepare data to send to the API
				const data = {
					results: results.map((result) => {
						const resultData: Record<string, unknown> = {
							case_id: result.caseId,
						};

						// Add status ID if specified
						if (result.statusId) {
							resultData.status_id = result.statusId;
						}

						// Add comment if specified
						if (result.comment) {
							resultData.comment = result.comment;
						}

						// Add version if specified
						if (result.version) {
							resultData.version = result.version;
						}

						// Add elapsed time if specified
						if (result.elapsed) {
							resultData.elapsed = result.elapsed;
						}

						// Add defects if specified
						if (result.defects) {
							resultData.defects = result.defects;
						}

						// Add assignee ID if specified
						if (result.assignedtoId) {
							resultData.assignedto_id = result.assignedtoId;
						}

						return resultData;
					}),
				};

				const addedResults = await testRailClient.results.addResultsForCases(
					runId,
					data,
				);
				const successResponse = createSuccessResponse(
					"Results added successfully",
					{
						results: addedResults,
					},
				);
				return {
					content: [{ type: "text", text: JSON.stringify(successResponse) }],
				};
			} catch (error) {
				const errorResponse = createErrorResponse(
					`Error adding results for run ${runId}`,
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
