import { z } from "zod";

/**
 * 中期指標エンティティのZodスキーマ（1-6ヶ月向け）
 * - RSI: 14週
 * - 価格レンジ: 26週
 */
export const midTermIndicatorSchema = z.object({
  stockId: z.string().uuid(),
  collectedAt: z.string(), // ISO date string (YYYY-MM-DD)

  // 財務指標
  currentPrice: z.number().nullable(),
  per: z.number().nullable(),
  pbr: z.number().nullable(),

  // テクニカル指標（週足・14週RSI）
  rsi: z.number().nullable(),

  // 価格レンジ指標（26週）
  priceHigh: z.number().nullable(),
  priceLow: z.number().nullable(),

  // 業種コード（sector_averages参照用）
  sectorCode: z.string().nullable(),
});

/**
 * 中期指標エンティティ型
 */
export type MidTermIndicator = z.infer<typeof midTermIndicatorSchema>;

/**
 * 中期指標エンティティの生成パラメータ
 */
export type CreateMidTermIndicatorParams = {
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
 * 中期指標エンティティを生成する
 * バリデーションを行い、正しい形式のエンティティを返す
 */
export const createMidTermIndicator = (params: CreateMidTermIndicatorParams): MidTermIndicator => {
  return midTermIndicatorSchema.parse({
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
