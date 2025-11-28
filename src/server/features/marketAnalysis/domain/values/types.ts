/**
 * マーケット分析の値オブジェクト型定義
 * TODO: 配置場所を検討する
 */

import { z } from "zod";

/**
 * 投資期間タイプ
 */
export const PeriodTypeSchema = z.enum(["mid_term", "long_term"]);
export type PeriodType = z.infer<typeof PeriodTypeSchema>;

/**
 * セクター情報
 */
export const SectorInfoSchema = z.object({
  sectorCode: z.string().max(10),
  sectorName: z.string().max(100),
  reason: z.string().max(80),
});
export type SectorInfo = z.infer<typeof SectorInfoSchema>;

/**
 * テーマ情報
 */
export const ThemeInfoSchema = z.object({
  theme: z.string().max(50),
  description: z.string().max(100),
});
export type ThemeInfo = z.infer<typeof ThemeInfoSchema>;

/**
 * マーケット分析結果（LLMレスポンス）
 */
export const MarketAnalysisResultSchema = z.object({
  periodType: PeriodTypeSchema,

  // 金利動向分析
  interestRateTrend: z.string().max(500),

  // 注目セクター（3-5件）
  favorableSectors: z.array(SectorInfoSchema).min(3).max(5),

  // 注意セクター（2-3件）
  unfavorableSectors: z.array(SectorInfoSchema).min(2).max(3),

  // 注目テーマ・事業内容（3-5件）
  favorableThemes: z.array(ThemeInfoSchema).min(3).max(5),

  // 注意テーマ・事業内容（2-3件）
  unfavorableThemes: z.array(ThemeInfoSchema).min(2).max(3),

  // 経済・マーケット総括（300文字程度）
  economicSummary: z.string().max(500),
});
export type MarketAnalysisResult = z.infer<typeof MarketAnalysisResultSchema>;
