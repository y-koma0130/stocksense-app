/**
 * LINE銘柄分析履歴を保存するリポジトリ
 */

import type { PeriodType } from "@/constants/periodTypes";
import { db } from "@/db";
import { lineStockAnalysisUsage } from "@/db/schema";
import { nowJST } from "@/lib/datetime/jst";

/**
 * LINE銘柄分析履歴を保存する関数の型定義
 */
export type SaveLineStockAnalysisUsage = (params: {
  lineUserId: string;
  stockId: string;
  tickerCode: string;
  periodType: PeriodType;
}) => Promise<void>;

/**
 * 分析履歴を保存
 */
export const saveLineStockAnalysisUsage: SaveLineStockAnalysisUsage = async ({
  lineUserId,
  stockId,
  tickerCode,
  periodType,
}) => {
  await db.insert(lineStockAnalysisUsage).values({
    lineUserId,
    stockId,
    tickerCode,
    periodType,
    analyzedAt: nowJST(),
  });
};
