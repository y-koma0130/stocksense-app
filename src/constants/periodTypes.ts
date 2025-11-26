import { z } from "zod";

/**
 * 期間タイプのZodスキーマ
 */
export const periodTypeSchema = z.enum(["mid_term", "long_term"]);

/**
 * 期間タイプの型定義
 */
export type PeriodType = z.infer<typeof periodTypeSchema>;

/**
 * 期間タイプの定数
 */
export const PERIOD_TYPES = {
  MID_TERM: "mid_term",
  LONG_TERM: "long_term",
} as const;
