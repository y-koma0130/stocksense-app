import { z } from "zod";
import { baseIndicatorDtoSchema } from "./baseIndicator.dto";
import { type LongTermIndicatorDto, longTermIndicatorDtoSchema } from "./longTermIndicator.dto";
import { type MidTermIndicatorDto, midTermIndicatorDtoSchema } from "./midTermIndicator.dto";

/**
 * 統合指標DTOスキーマ（中期 or 長期）
 */
export const indicatorDtoSchema = z.discriminatedUnion("periodType", [
  midTermIndicatorDtoSchema,
  longTermIndicatorDtoSchema,
]);

/**
 * 指標DTO型（中期 or 長期の統合型）
 */
export type IndicatorDto = z.infer<typeof indicatorDtoSchema>;

// 個別DTO型の再エクスポート
export type { MidTermIndicatorDto, LongTermIndicatorDto };
export { midTermIndicatorDtoSchema, longTermIndicatorDtoSchema, baseIndicatorDtoSchema };
