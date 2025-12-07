import { z } from "zod";
import { baseIndicatorDtoSchema } from "./baseIndicator.dto";

/**
 * 中期指標DTOスキーマ
 * rsiShort: 短期RSI（2週）- RSIモメンタム計算用
 * avgVolumeShort, avgVolumeLong: 出来高指標 - 罠株除外・スコアリング用
 * epsLatest, eps3yAgo: EPS成長率計算用（グロース市場のみ使用）
 * macroTagIds, themeTagIds: タグスコア計算用（グロース市場のみ使用）
 */
export const midTermIndicatorDtoSchema = baseIndicatorDtoSchema.extend({
  periodType: z.literal("mid_term"),
  rsiShort: z.number().nullable(),
  avgVolumeShort: z.number().nullable(),
  avgVolumeLong: z.number().nullable(),
  epsLatest: z.number().nullable(),
  eps3yAgo: z.number().nullable(),
  macroTagIds: z.array(z.string()),
  themeTagIds: z.array(z.string()),
});

export type MidTermIndicatorDto = z.infer<typeof midTermIndicatorDtoSchema>;
