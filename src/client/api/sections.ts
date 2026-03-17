import { BaseTestRailClient } from "./baseClient.js";
import { TestRailSection } from "../../shared/schemas/sections.js";
import { handleApiError } from "./utils.js";
import {
	GetSectionInputType,
	GetSectionsInputType,
	AddSectionInputType,
	MoveSectionInputType,
	UpdateSectionInputType,
	DeleteSectionInputType,
} from "../../shared/schemas/sections.js";

export class SectionsClient extends BaseTestRailClient {
	/**
	 * Get a specific section
	 */
	async getSection(
		sectionId: GetSectionInputType["sectionId"],
	): Promise<TestRailSection> {
		try {
			console.log(`Getting section ${sectionId}`);
			const response = await this.client.get<TestRailSection>(
				`/api/v2/get_section/${sectionId}`,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to get section ${sectionId}`);
		}
	}

	/**
	 * Get all sections for a project with automatic pagination.
	 * The TestRail API returns at most 250 sections per request.
	 * This method automatically fetches all pages and returns the
	 * complete list of sections.
	 */
	async getSections(
		projectId: GetSectionsInputType["projectId"],
		suiteId?: GetSectionsInputType["suiteId"],
		params?: Record<string, string | number | boolean | null | undefined>,
	): Promise<TestRailSection[]> {
		try {
			console.log(`Getting sections for project ${projectId}`);
			const url = `/api/v2/get_sections/${projectId}`;
			const baseParams = suiteId
				? { ...params, suite_id: suiteId }
				: params;

			const allSections: TestRailSection[] = [];
			let offset = 0;
			const limit = 250;

			// eslint-disable-next-line no-constant-condition
			while (true) {
				const queryParams = { ...baseParams, limit, offset };
				const response = await this.client.get<{
					offset: number;
					limit: number;
					size: number;
					_links: { next: string | null; prev: string | null };
					sections: TestRailSection[];
				}>(url, { params: queryParams });

				const page = response.data;
				allSections.push(...page.sections);

				if (page._links.next === null) {
					break;
				}
				offset += limit;
			}

			return allSections;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to get sections for project ${projectId}`,
			);
		}
	}

	/**
	 * Add a new section
	 */
	async addSection(
		projectId: AddSectionInputType["projectId"],
		data: {
			name: AddSectionInputType["name"];
			description?: AddSectionInputType["description"];
			suite_id?: AddSectionInputType["suiteId"];
			parent_id?: AddSectionInputType["parentId"];
		},
	): Promise<TestRailSection> {
		try {
			console.log(`Adding section to project ${projectId}`);
			const response = await this.client.post<TestRailSection>(
				`/api/v2/add_section/${projectId}`,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to add section to project ${projectId}`,
			);
		}
	}

	/**
	 * Move a section to a different parent or position
	 */
	async moveSection(
		sectionId: MoveSectionInputType["sectionId"],
		data: {
			parent_id?: MoveSectionInputType["parentId"];
			after_id?: MoveSectionInputType["afterId"];
		},
	): Promise<TestRailSection> {
		try {
			console.log(`Moving section ${sectionId}`);
			const response = await this.client.post<TestRailSection>(
				`/api/v2/move_section/${sectionId}`,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to move section ${sectionId}`);
		}
	}

	/**
	 * Update an existing section
	 */
	async updateSection(
		sectionId: UpdateSectionInputType["sectionId"],
		data: {
			name?: UpdateSectionInputType["name"];
			description?: UpdateSectionInputType["description"];
		},
	): Promise<TestRailSection> {
		try {
			console.log(`Updating section ${sectionId}`);
			const response = await this.client.post<TestRailSection>(
				`/api/v2/update_section/${sectionId}`,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to update section ${sectionId}`);
		}
	}

	/**
	 * Delete an existing section
	 */
	async deleteSection(
		sectionId: DeleteSectionInputType["sectionId"],
		soft?: DeleteSectionInputType["soft"],
	): Promise<void> {
		try {
			console.log(`Deleting section ${sectionId}`);
			const url = soft
				? `/api/v2/delete_section/${sectionId}?soft=1`
				: `/api/v2/delete_section/${sectionId}`;

			await this.client.post(url, {});
		} catch (error) {
			throw handleApiError(error, `Failed to delete section ${sectionId}`);
		}
	}
}
