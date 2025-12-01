import { z } from "zod";

/**
 * 中期指標エンティティのZodスキーマ（1-6ヶ月向け）
 * - RSI: 14週（ベース）、2週（短期）
 * - RSIモメンタム: スコア計算時に rsiShort - rsi で算出
 * - 価格レンジ: 26週
 * - 出来高: 短期平均、長期平均（罠株除外・スコアリング用）
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

  // テクニカル指標（週足・2週RSI - 短期モメンタム用）
  rsiShort: z.number().nullable(),

  // 価格レンジ指標（26週）
  priceHigh: z.number().nullable(),
  priceLow: z.number().nullable(),

  // 出来高指標（罠株除外・スコアリング用）
  avgVolumeShort: z.number().nullable(), // 短期平均出来高
  avgVolumeLong: z.number().nullable(), // 長期平均出来高

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
  rsiShort: number | null;
  priceHigh: number | null;
  priceLow: number | null;
  avgVolumeShort: number | null;
  avgVolumeLong: number | null;
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
    rsiShort: params.rsiShort,
    priceHigh: params.priceHigh,
    priceLow: params.priceLow,
    avgVolumeShort: params.avgVolumeShort,
    avgVolumeLong: params.avgVolumeLong,
    sectorCode: params.sectorCode,
  });
};
