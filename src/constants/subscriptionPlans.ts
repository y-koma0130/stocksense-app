import { z } from "zod";

/**
 * サブスクリプションプランのZodスキーマ
 */
export const subscriptionPlanSchema = z.enum(["free", "standard", "pro"]);

/**
 * サブスクリプションプランの型定義
 */
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;

/**
 * サブスクリプションプランの定数
 */
export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  STANDARD: "standard",
  PRO: "pro",
} as const;

/**
 * プランの表示名
 */
export const PLAN_DISPLAY_NAMES: Record<SubscriptionPlan, string> = {
  free: "フリー",
  standard: "スタンダード",
  pro: "プロ",
};

/**
 * LINE銘柄分析の月間利用上限（プラン別）
 */
export const LINE_STOCK_ANALYSIS_LIMITS: Record<SubscriptionPlan, number> = {
  free: 10,
  standard: 30,
  pro: 100,
};
