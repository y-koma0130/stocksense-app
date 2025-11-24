import { isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { stocks } from "@/db/schema";

/**
 * 上場中の銘柄DTOスキーマ
 */
export const activeStockDtoSchema = z.object({
  id: z.string(),
  tickerSymbol: z.string(),
  sectorCode: z.string().nullable(),
});

export type ActiveStockDto = z.infer<typeof activeStockDtoSchema>;

/**
 * 上場中の銘柄を取得する関数の型定義
 */
export type GetActiveStocks = () => Promise<ActiveStockDto[]>;

/**
 * 上場中の銘柄を取得する
 * deletedAtがNULLの銘柄を全件取得
 */
export const getActiveStocks: GetActiveStocks = async () => {
  const result = await db
    .select({
      id: stocks.id,
      tickerSymbol: stocks.tickerSymbol,
      sectorCode: stocks.sectorCode,
    })
    .from(stocks)
    .where(isNull(stocks.deletedAt));

  return result.map((row) =>
    activeStockDtoSchema.parse({
      id: row.id,
      tickerSymbol: row.tickerSymbol,
      sectorCode: row.sectorCode,
    }),
  );
};
