import { z } from "zod";
import { periodTypeSchema } from "../values/periodType";

/**
 * 銘柄指標エンティティのZodスキーマ
 *
 * TODO: 各指標を値オブジェクトとして分離する
 * - currentPrice, per, pbr, rsi, week52High, week52Low を
 *   それぞれ値オブジェクトとして定義し、より堅牢なバリデーションを行う
 */
export const stockIndicatorSchema = z.object({
  stockId: z.string().uuid(),
  collectedAt: z.string(), // ISO date string (YYYY-MM-DD)
  periodType: periodTypeSchema,

  // 財務指標
  currentPrice: z.number().nullable(),
  per: z.number().nullable(),
  pbr: z.number().nullable(),

  // テクニカル指標
  rsi: z.number().nullable(),

  // 価格レンジ指標
  week52High: z.number().nullable(),
  week52Low: z.number().nullable(),

  // 業種平均（参照データ）
  sectorCode: z.string().nullable(),
  sectorAvgPer: z.number().nullable(),
  sectorAvgPbr: z.number().nullable(),
});

/**
 * 銘柄指標エンティティ型
 */
export type StockIndicator = z.infer<typeof stockIndicatorSchema>;

/**
 * 銘柄指標エンティティの生成パラメータ
 */
export type CreateStockIndicatorParams = {
  stockId: string;
  collectedAt: string;
  periodType: "weekly" | "monthly";
  currentPrice: number | null;
  per: number | null;
  pbr: number | null;
  rsi: number | null;
  week52High: number | null;
  week52Low: number | null;
  sectorCode: string | null;
  sectorAvgPer: number | null;
  sectorAvgPbr: number | null;
};

/**
 * 銘柄指標エンティティを生成する
 * バリデーションを行い、正しい形式のエンティティを返す
 */
export const createStockIndicator = (params: CreateStockIndicatorParams): StockIndicator => {
  return stockIndicatorSchema.parse({
    stockId: params.stockId,
    collectedAt: params.collectedAt,
    periodType: params.periodType,
    currentPrice: params.currentPrice,
    per: params.per,
    pbr: params.pbr,
    rsi: params.rsi,
    week52High: params.week52High,
    week52Low: params.week52Low,
    sectorCode: params.sectorCode,
    sectorAvgPer: params.sectorAvgPer,
    sectorAvgPbr: params.sectorAvgPbr,
  });
};
