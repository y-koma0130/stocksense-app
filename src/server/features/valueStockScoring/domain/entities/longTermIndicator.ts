import { z } from "zod";

/**
 * 長期指標エンティティのZodスキーマ（6ヶ月-3年向け）
 * - RSI: 52週
 * - 価格レンジ: 52週
 */
export const longTermIndicatorSchema = z.object({
  stockId: z.string().uuid(),
  collectedAt: z.string(), // ISO date string (YYYY-MM-DD)

  // 財務指標
  currentPrice: z.number().nullable(),
  per: z.number().nullable(),
  pbr: z.number().nullable(),

  // テクニカル指標（週足・52週RSI）
  rsi: z.number().nullable(),

  // 価格レンジ指標（52週）
  priceHigh: z.number().nullable(),
  priceLow: z.number().nullable(),

  // 業種コード（sector_averages参照用）
  sectorCode: z.string().nullable(),
});

/**
 * 長期指標エンティティ型
 */
export type LongTermIndicator = z.infer<typeof longTermIndicatorSchema>;

/**
 * 長期指標エンティティの生成パラメータ
 */
export type CreateLongTermIndicatorParams = {
  stockId: string;
  collectedAt: string;
  currentPrice: number | null;
  per: number | null;
  pbr: number | null;
  rsi: number | null;
  priceHigh: number | null;
  priceLow: number | null;
  sectorCode: string | null;
};

/**
 * 長期指標エンティティを生成する
 * バリデーションを行い、正しい形式のエンティティを返す
 */
export const createLongTermIndicator = (
  params: CreateLongTermIndicatorParams,
): LongTermIndicator => {
  return longTermIndicatorSchema.parse({
    stockId: params.stockId,
    collectedAt: params.collectedAt,
    currentPrice: params.currentPrice,
    per: params.per,
    pbr: params.pbr,
    rsi: params.rsi,
    priceHigh: params.priceHigh,
    priceLow: params.priceLow,
    sectorCode: params.sectorCode,
  });
};
