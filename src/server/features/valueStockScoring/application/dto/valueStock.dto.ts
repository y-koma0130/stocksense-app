import { z } from "zod";
import { valueScoreSchema } from "../../domain/services/calculateValueScore.service";
import { indicatorDtoSchema } from "./indicator.dto";

/**
 * スコア付き銘柄指標DTOスキーマ
 * クエリサービスから取得したIndicatorDTOにスコアを付加したもの
 */
export const valueStockDtoSchema = z.intersection(
  indicatorDtoSchema,
  z.object({
    valueScore: valueScoreSchema,
  }),
);

/**
 * スコア付き銘柄指標DTO型
 */
export type ValueStockDto = z.infer<typeof valueStockDtoSchema>;
