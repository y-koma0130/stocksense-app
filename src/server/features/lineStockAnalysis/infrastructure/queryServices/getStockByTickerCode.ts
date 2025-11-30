/**
 * 証券コードで銘柄を検索するクエリサービス
 */

import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { stocks } from "@/db/schema";
import {
  type StockBasicInfoDto,
  stockBasicInfoDtoSchema,
} from "../../application/dto/stockBasicInfo.dto";

/**
 * 証券コードで銘柄を取得する関数の型定義
 */
export type GetStockByTickerCode = (tickerCode: string) => Promise<StockBasicInfoDto | null>;

/**
 * 証券コードで上場中の銘柄を取得
 * 4桁の証券コード（例: "7203"）で検索
 */
export const getStockByTickerCode: GetStockByTickerCode = async (tickerCode) => {
  const result = await db
    .select({
      id: stocks.id,
      tickerCode: stocks.tickerCode,
      name: stocks.name,
      sectorCode: stocks.sectorCode,
      sectorName: stocks.sectorName,
      market: stocks.market,
    })
    .from(stocks)
    .where(and(eq(stocks.tickerCode, tickerCode), isNull(stocks.deletedAt)))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  return stockBasicInfoDtoSchema.parse({
    id: row.id,
    tickerCode: row.tickerCode,
    name: row.name,
    sectorCode: row.sectorCode,
    sectorName: row.sectorName,
    market: row.market,
  });
};
