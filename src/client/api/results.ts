// テスト結果に関するAPIクライアントの実装
import { AxiosResponse } from "axios";
import { BaseTestRailClient } from "./baseClient.js";
import { TestRailResult } from "./types.js";
import { handleApiError } from "./utils.js";

export class ResultsClient extends BaseTestRailClient {
	/**
	 * 1つのテストに対する結果のリストを返します
	 * @param testId テストのID
	 * @param params オプションのパラメータ（limit, offset, defects_filter, status_id）
	 * @returns テスト結果のリスト
	 */
	async getResults(
		testId: number,
		params?: Record<string, string | number | boolean | null | undefined>,
	): Promise<TestRailResult[]> {
		try {
			const response: AxiosResponse<TestRailResult[]> = await this.client.get(
				`/api/v2/get_results/${testId}`,
				{ params },
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to get results for test ${testId}`);
		}
	}

	/**
	 * テストケースIDとテストランIDに基づいて、そのテストの結果のリストを返します
	 * @param runId テストランのID
	 * @param caseId テストケースのID
	 * @param params オプションのパラメータ（limit, offset, defects_filter, status_id）
	 * @returns テスト結果のリスト
	 */
	async getResultsForCase(
		runId: number,
		caseId: number,
		params?: Record<string, string | number | boolean | null | undefined>,
	): Promise<TestRailResult[]> {
		try {
			const response: AxiosResponse<TestRailResult[]> = await this.client.get(
				`/api/v2/get_results_for_case/${runId}/${caseId}`,
				{ params },
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				`Failed to get results for case ${caseId} in run ${runId}`,
			);
		}
	}

	/**
	 * テストランに対する結果のリストを返します
	 * @param runId テストランのID
	 * @param params オプションのパラメータ（limit, offset, defects_filter, status_id）
	 * @returns テスト結果のリスト
	 */
	async getResultsForRun(
		runId: number,
		params?: Record<string, string | number | boolean | null | undefined>,
	): Promise<TestRailResult[]> {
		try {
			const response: AxiosResponse<TestRailResult[]> = await this.client.get(
				`/api/v2/get_results_for_run/${runId}`,
				{ params },
			);
			return response.data;
		} catch (error) {
			throw handleApiError(error, `Failed to get results for run ${runId}`);
		}
	}

	/**
	 * テストケースとテストランに基づいてテスト結果を追加します
	 * @param runId テストランのID
	 * @param caseId テストケースのID
	 * @param data テスト結果のデータ（status_id, comment, version, elapsed, defects, assignedto_id など）
	 * @returns 追加されたテスト結果
	 */
	async addResultForCase(
		runId: number,
		caseId: number,
		data: Record<string, unknown>,
	): Promise<TestRailResult> {
		try {
			// デバッグログを追加
			console.log(
				`Sending request to add result for case ${caseId} in run ${runId}`,
			);

			// リクエスト実行
			const response: AxiosResponse<TestRailResult> = await this.client.post(
				`/api/v2/add_result_for_case/${runId}/${caseId}`,
				data,
			);
			return response.data;
		} catch (error) {
			// エラーをより詳細に記録
			console.error("Error adding result for case. Details:", error);
			throw handleApiError(
				error,
				`Failed to add result for case ${caseId} in run ${runId}`,
			);
		}
	}
}
