import { z } from "zod";
import { MARKET_VALUES } from "@/assets/marketOptions";
import { SECTOR_CODES } from "@/assets/stockMarketSectors";

/**
 * フィルター条件の値オブジェクトスキーマ
 */
export const filterConditionsSchema = z
  .object({
    markets: z.array(z.enum(MARKET_VALUES)).nullable(),
    sectorCodes: z.array(z.enum(SECTOR_CODES)).nullable(),
    priceMin: z.number().int().positive().nullable(),
    priceMax: z.number().int().positive().nullable(),
  })
  .refine(
    (data) => {
      // priceMinとpriceMaxの両方が存在する場合、priceMin <= priceMaxをチェック
      if (data.priceMin !== null && data.priceMax !== null) {
        return data.priceMin <= data.priceMax;
      }
      return true;
    },
    {
      message: "最小価格は最大価格以下である必要があります",
      path: ["priceMin"],
    },
  );

export type FilterConditions = z.infer<typeof filterConditionsSchema>;

/**
 * フィルター条件の生成パラメータ
 */
export type CreateFilterConditionsParams = Readonly<{
  markets?: string[] | null;
  sectorCodes?: string[] | null;
  priceMin?: number | null;
  priceMax?: number | null;
}>;

/**
 * フィルター条件を生成する
 */
export const createFilterConditions = (params: CreateFilterConditionsParams): FilterConditions => {
  return filterConditionsSchema.parse({
    markets: params.markets ?? null,
    sectorCodes: params.sectorCodes ?? null,
    priceMin: params.priceMin ?? null,
    priceMax: params.priceMax ?? null,
  });
};
