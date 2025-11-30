/**
 * 銘柄基本情報DTO
 * getStockByTickerCodeで返却される銘柄の基本情報
 */

import { z } from "zod";

/**
 * 銘柄基本情報DTOスキーマ
 */
export const stockBasicInfoDtoSchema = z.object({
  id: z.string(),
  tickerCode: z.string(),
  name: z.string(),
  sectorCode: z.string().nullable(),
  sectorName: z.string().nullable(),
  market: z.string().nullable(),
});

/**
 * 銘柄基本情報DTO型
 */
export type StockBasicInfoDto = z.infer<typeof stockBasicInfoDtoSchema>;
