/**
 * 個別株分析の値オブジェクト型定義
 */

import { z } from "zod";
import { VALUE_STOCK_RATINGS } from "@/constants/valueStockRatings";

/**
 * バリュー株としての評価（5段階）
 * 既に内部スコアリングにより上位に抽出された銘柄の相対評価
 */
export const ValueStockRatingSchema = z.enum([
  VALUE_STOCK_RATINGS.EXCELLENT,
  VALUE_STOCK_RATINGS.GOOD,
  VALUE_STOCK_RATINGS.FAIR,
  VALUE_STOCK_RATINGS.POOR,
  VALUE_STOCK_RATINGS.VERY_POOR,
]);
export type ValueStockRating = z.infer<typeof ValueStockRatingSchema>;

/**
 * 個別株分析結果スキーマ
 */
export const StockAnalysisResultSchema = z.object({
  // バリュー株としての評価（5段階）
  valueStockRating: ValueStockRatingSchema.describe(
    "バリュー株としての評価。excellent/good/fair/poor/very_poorのいずれか",
  ),

  // 総合評価コメント - 割安度の根拠と投資判断の視点
  // LLMが超過する場合に備えて余裕を持たせる（UI側で300字折りたたみ）
  summary: z.string().min(50).max(1500).describe("総合評価コメント。300-400字程度で記述"),

  // LINE通知用の短い要約（80-100字）
  summaryShort: z.string().max(150).nullable().describe("LINE通知用の短い要約。80-100字程度で記述"),

  // 投資する場合の魅力ポイント（3-4項目）
  // プロンプトでは60-80字を指示するが、超過に備えて余裕を持たせる
  investmentPoints: z
    .array(z.string().max(150).describe("各項目60-80字程度"))
    .min(3)
    .max(4)
    .describe("投資魅力ポイント。3-4項目の配列"),

  // 注意すべきリスク（2-3項目）
  // プロンプトでは60-80字を指示するが、超過に備えて余裕を持たせる
  risks: z
    .array(z.string().max(150).describe("各項目60-80字程度"))
    .min(2)
    .max(3)
    .describe("注意すべきリスク。2-3項目の配列"),
});

export type StockAnalysisResult = z.infer<typeof StockAnalysisResultSchema>;
