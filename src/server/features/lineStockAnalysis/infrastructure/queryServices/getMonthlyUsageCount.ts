/**
 * LINE銘柄分析の月間使用回数を取得するクエリサービス
 */

import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { lineStockAnalysisUsage } from "@/db/schema";

/**
 * 月間使用回数を取得する関数の型定義
 */
export type GetMonthlyUsageCount = (params: {
  lineUserId: string;
  yearMonth: string;
}) => Promise<number>;

/**
 * 指定月の使用回数を取得
 * yearMonthは "YYYY-MM" 形式
 */
export const getMonthlyUsageCount: GetMonthlyUsageCount = async ({ lineUserId, yearMonth }) => {
  // 月初と月末の日付を計算
  const [year, month] = yearMonth.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const startOfNextMonth = new Date(year, month, 1);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(lineStockAnalysisUsage)
    .where(
      and(
        eq(lineStockAnalysisUsage.lineUserId, lineUserId),
        gte(lineStockAnalysisUsage.analyzedAt, startOfMonth),
        lt(lineStockAnalysisUsage.analyzedAt, startOfNextMonth),
      ),
    );

  return Number(result[0]?.count ?? 0);
};
