/**
 * タイムアウト付き銘柄分析実行
 */

import type { ExecuteStockAnalysis, ExecuteStockAnalysisResult } from "./executeStockAnalysis";

/**
 * タイムアウト付き分析実行関数の型定義
 */
export type ExecuteStockAnalysisWithTimeout = (
  executeStockAnalysis: ExecuteStockAnalysis,
  params: { instructions: string; input: string },
  timeoutMs: number,
) => Promise<ExecuteStockAnalysisResult>;

/**
 * タイムアウトエラーを表すカスタムエラー
 */
export class AnalysisTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`分析がタイムアウトしました（${timeoutMs / 1000}秒）`);
    this.name = "AnalysisTimeoutError";
  }
}

/**
 * タイムアウト付きで銘柄分析を実行
 * 指定時間内に完了しなかった場合はタイムアウトエラーを返す
 */
export const executeStockAnalysisWithTimeout: ExecuteStockAnalysisWithTimeout = async (
  executeStockAnalysis,
  params,
  timeoutMs,
) => {
  const timeoutPromise = new Promise<ExecuteStockAnalysisResult>((_, reject) => {
    setTimeout(() => {
      reject(new AnalysisTimeoutError(timeoutMs));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([executeStockAnalysis(params), timeoutPromise]);
    return result;
  } catch (error) {
    if (error instanceof AnalysisTimeoutError) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "分析中にエラーが発生しました。",
    };
  }
};
