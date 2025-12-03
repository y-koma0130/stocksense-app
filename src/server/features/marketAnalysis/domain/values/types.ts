/**
 * マーケット分析の値オブジェクト型定義
 */

import { z } from "zod";
import { MACRO_TAG_IDS } from "@/assets/macroTags";
import { THEME_TAG_IDS } from "@/assets/themeTags";

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
  // プロンプトでは60文字以内と指示、バッファとして100文字まで許容
  reason: z.string().max(100),
});
export type SectorInfo = z.infer<typeof SectorInfoSchema>;

/**
 * テーマ情報
 */
export const ThemeInfoSchema = z.object({
  // プロンプトでは30文字以内と指示、バッファとして50文字まで許容
  theme: z.string().max(50),
  // プロンプトでは80文字以内と指示、バッファとして120文字まで許容
  description: z.string().max(120),
});
export type ThemeInfo = z.infer<typeof ThemeInfoSchema>;

/**
 * マクロタグIDスキーマ
 */
export const MacroTagIdSchema = z.enum(MACRO_TAG_IDS);

/**
 * テーマタグIDスキーマ
 */
export const ThemeTagIdSchema = z.enum(THEME_TAG_IDS);

/**
 * 共通のマーケット分析ベーススキーマ
 */
const BaseMarketAnalysisSchema = z.object({
  periodType: PeriodTypeSchema,

  // 金利動向分析（プロンプトでは400文字以内と指示、バッファとして600文字まで許容）
  interestRateTrend: z.string().max(600),

  // 注目セクター（3-5件）
  favorableSectors: z.array(SectorInfoSchema).min(3).max(5),

  // 注意セクター（2-3件）
  unfavorableSectors: z.array(SectorInfoSchema).min(2).max(3),

  // 注目テーマ・事業内容（3-5件）
  favorableThemes: z.array(ThemeInfoSchema).min(3).max(5),

  // 注意テーマ・事業内容（2-3件）
  unfavorableThemes: z.array(ThemeInfoSchema).min(2).max(3),

  // 経済・マーケット総括（プロンプトでは400文字以内と指示、バッファとして600文字まで許容）
  economicSummary: z.string().max(600),
});

/**
 * 中期マーケット分析結果スキーマ（タグ選定なし）
 */
export const MidTermMarketAnalysisResultSchema = BaseMarketAnalysisSchema;
export type MidTermMarketAnalysisResult = z.infer<typeof MidTermMarketAnalysisResultSchema>;

/**
 * 長期マーケット分析結果スキーマ（タグ選定あり）
 */
export const LongTermMarketAnalysisResultSchema = BaseMarketAnalysisSchema.extend({
  // 有望マクロタグ（3-5件）
  favorableMacroTags: z.array(MacroTagIdSchema).min(3).max(5),

  // 有望テーマタグ（5-8件）
  favorableThemeTags: z.array(ThemeTagIdSchema).min(5).max(8),

  // 不利マクロタグ（2-4件）
  unfavorableMacroTags: z.array(MacroTagIdSchema).min(2).max(4),

  // 不利テーマタグ（3-5件）
  unfavorableThemeTags: z.array(ThemeTagIdSchema).min(3).max(5),
});
export type LongTermMarketAnalysisResult = z.infer<typeof LongTermMarketAnalysisResultSchema>;

/**
 * マーケット分析結果（LLMレスポンス）- 統合型
 * 中期分析ではタグはオプショナル、長期分析では必須
 */
export const MarketAnalysisResultSchema = BaseMarketAnalysisSchema.extend({
  // 有望マクロタグ（長期分析のみ、3-5件）
  favorableMacroTags: z.array(MacroTagIdSchema).min(3).max(5).optional(),

  // 有望テーマタグ（長期分析のみ、5-8件）
  favorableThemeTags: z.array(ThemeTagIdSchema).min(5).max(8).optional(),

  // 不利マクロタグ（長期分析のみ、2-4件）
  unfavorableMacroTags: z.array(MacroTagIdSchema).min(2).max(4).optional(),

  // 不利テーマタグ（長期分析のみ、3-5件）
  unfavorableThemeTags: z.array(ThemeTagIdSchema).min(3).max(5).optional(),
});
export type MarketAnalysisResult = z.infer<typeof MarketAnalysisResultSchema>;
