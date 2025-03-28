import { AxiosResponse } from "axios";
import { BaseTestRailClient } from "./baseClient.js";
import { TestRailMilestone } from "./types.js";
import { handleApiError } from "./utils.js";

export class MilestonesClient extends BaseTestRailClient {
	/**
	 * Gets a specific milestone by ID
	 * @param milestoneId The ID of the milestone
	 * @returns Promise with milestone details
	 */
	async getMilestone(milestoneId: number): Promise<TestRailMilestone> {
		try {
			const response: AxiosResponse<TestRailMilestone> = await this.client.get(
				`/api/v2/get_milestone/${milestoneId}`,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to get milestone ${milestoneId}`);
		}
	}

	/**
	 * Gets all milestones for a project
	 * @param projectId The ID of the project
	 * @param filters Optional filter parameters
	 * @returns Promise with array of milestones
	 */
	async getMilestones(
		projectId: number,
		filters?: Record<string, string | number | boolean | null | undefined>,
	): Promise<TestRailMilestone[]> {
		try {
			const response: AxiosResponse<TestRailMilestone[]> =
				await this.client.get(`/api/v2/get_milestones/${projectId}`, {
					params: filters,
				});
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to get milestones for project ${projectId}`,
			);
		}
	}

	/**
	 * Adds a new milestone to a project
	 * @param projectId The ID of the project
	 * @param data The milestone data
	 * @returns Promise with created milestone
	 */
	async addMilestone(
		projectId: number,
		data: Record<string, unknown>,
	): Promise<TestRailMilestone> {
		try {
			const response: AxiosResponse<TestRailMilestone> = await this.client.post(
				`/api/v2/add_milestone/${projectId}`,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to add milestone to project ${projectId}`,
			);
		}
	}

	/**
	 * Updates an existing milestone
	 * @param milestoneId The ID of the milestone
	 * @param data The milestone data to update
	 * @returns Promise with updated milestone
	 */
	async updateMilestone(
		milestoneId: number,
		data: Record<string, unknown>,
	): Promise<TestRailMilestone> {
		try {
			const response: AxiosResponse<TestRailMilestone> = await this.client.post(
				`/api/v2/update_milestone/${milestoneId}`,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to update milestone ${milestoneId}`);
		}
	}

	/**
	 * Deletes a milestone
	 * @param milestoneId The ID of the milestone
	 */
	async deleteMilestone(milestoneId: number): Promise<void> {
		try {
			await this.client.post(`/api/v2/delete_milestone/${milestoneId}`, {});
		} catch (error) {
			throw handleApiError(error, `Failed to delete milestone ${milestoneId}`);
		}
	}
}
