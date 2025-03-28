import { BaseTestRailClient } from "./baseClient.js";
import { TestRailProject } from "./types.js";
import { handleApiError } from "./utils.js";
import {
	GetProjectInputType,
	AddProjectInputType,
	UpdateProjectInputType,
	DeleteProjectInputType,
} from "../../shared/schemas/projects.js";

export class ProjectsClient extends BaseTestRailClient {
	/**
	 * Get a specific project
	 */
	async getProject(
		projectId: GetProjectInputType["projectId"],
	): Promise<TestRailProject> {
		try {
			const response = await this.client.get<TestRailProject>(
				`/api/v2/get_project/${projectId}`,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to get project ${projectId}`);
		}
	}

	/**
	 * Get all projects
	 */
	async getProjects(
		params?: Record<string, string | number | boolean | null | undefined>,
	): Promise<TestRailProject[]> {
		try {
			const response = await this.client.get<TestRailProject[]>(
				"/api/v2/get_projects",
				{ params },
			);
			// For debugging
			console.error(
				"TestRail API getProjects raw response:",
				JSON.stringify(response.data),
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, "Failed to get projects");
		}
	}

	/**
	 * Create a new project
	 */
	async addProject(
		data: Omit<AddProjectInputType, "suite_mode"> & { suite_mode?: number },
	): Promise<TestRailProject> {
		try {
			const response = await this.client.post<TestRailProject>(
				"/api/v2/add_project",
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, "Failed to create project");
		}
	}

	/**
	 * Update an existing project
	 */
	async updateProject(
		projectId: UpdateProjectInputType["projectId"],
		data: Omit<UpdateProjectInputType, "projectId">,
	): Promise<TestRailProject> {
		try {
			const response = await this.client.post<TestRailProject>(
				`/api/v2/update_project/${projectId}`,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to update project ${projectId}`);
		}
	}

	/**
	 * Delete an existing project
	 */
	async deleteProject(
		projectId: DeleteProjectInputType["projectId"],
	): Promise<void> {
		try {
			await this.client.post(`/api/v2/delete_project/${projectId}`, {});
		} catch (error) {
			throw handleApiError(error, `Failed to delete project ${projectId}`);
		}
	}
}
