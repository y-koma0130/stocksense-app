import { db } from "@/db";
import { stockFinancialHealth } from "@/db/schema";
import type { StockFinancialHealth } from "../../domain/entities/stockFinancialHealth";

/**
 * 銘柄の財務健全性データをUPSERTする関数の型定義
 */
export type UpsertStockFinancialHealth = (entity: StockFinancialHealth) => Promise<void>;

/**
 * 銘柄の財務健全性データをDBにUPSERT
 * stockIdがユニークキーなので、既存レコードがあれば更新、なければ挿入
 */
export const upsertStockFinancialHealth: UpsertStockFinancialHealth = async (entity) => {
  await db
    .insert(stockFinancialHealth)
    .values({
      stockId: entity.stockId,
      equityRatio: entity.equityRatio?.toString() ?? null,
      operatingIncomeDeclineYears: entity.operatingIncomeDeclineYears,
      operatingCashFlowNegativeYears: entity.operatingCashFlowNegativeYears,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: stockFinancialHealth.stockId,
      set: {
        equityRatio: entity.equityRatio?.toString() ?? null,
        operatingIncomeDeclineYears: entity.operatingIncomeDeclineYears,
        operatingCashFlowNegativeYears: entity.operatingCashFlowNegativeYears,
        updatedAt: new Date(),
      },
    });
};
