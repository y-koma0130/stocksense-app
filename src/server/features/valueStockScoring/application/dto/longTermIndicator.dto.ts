import { z } from "zod";
import { baseIndicatorDtoSchema } from "./baseIndicator.dto";

/**
 * 長期指標DTOスキーマ
 * avgVolumeShort: 出来高指標 - 罠株除外用
 * epsLatest, eps3yAgo: EPS成長率計算用（長期スコアリング用）
 * macroTagIds, themeTagIds: タグスコア計算用（全市場で使用）
 */
export const longTermIndicatorDtoSchema = baseIndicatorDtoSchema.extend({
  periodType: z.literal("long_term"),
  avgVolumeShort: z.number().nullable(),
  epsLatest: z.number().nullable(),
  eps3yAgo: z.number().nullable(),
  macroTagIds: z.array(z.string()),
  themeTagIds: z.array(z.string()),
});

export type LongTermIndicatorDto = z.infer<typeof longTermIndicatorDtoSchema>;
