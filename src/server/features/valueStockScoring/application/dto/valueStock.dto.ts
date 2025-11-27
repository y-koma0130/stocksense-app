import { z } from "zod";
import { valueStockScoreSchema } from "../../domain/entities/valueStockScore";
import { indicatorDtoSchema } from "./indicator.dto";

/**
 * スコア付き銘柄指標DTOスキーマ
 * クエリサービスから取得したIndicatorDTOにスコアを付加したもの
 */
export const valueStockDtoSchema = z.intersection(
  indicatorDtoSchema,
  z.object({
    valueScore: valueStockScoreSchema,
  }),
);

/**
 * スコア付き銘柄指標DTO型
 */
export type ValueStockDto = z.infer<typeof valueStockDtoSchema>;
