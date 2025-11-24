import { z } from "zod";
import type { SectorAverageDataDto } from "../../application/dto/sectorAverage.dto";
import { dataDateSchema } from "../values/dataDate";

// TODO: 集約の要素（sectors配列の各要素）を値オブジェクトとしてvalues/に定義する
// 現在は暫定的にインラインで定義

/**
 * 業種平均データ集約
 * 基準日と業種データのセット
 */
export const sectorAveragesAggregateSchema = z.object({
  dataDate: dataDateSchema,
  sectors: z.array(
    z.object({
      sectorCode: z.string(),
      sectorName: z.string(),
      avgPer: z.number().nullable(),
      avgPbr: z.number().nullable(),
      medianPer: z.number().nullable(),
      medianPbr: z.number().nullable(),
      stockCount: z.number().int(),
    }),
  ),
});

export type SectorAveragesAggregate = z.infer<typeof sectorAveragesAggregateSchema>;

/**
 * 業種平均データ集約を生成
 * DTOから集約を生成し、バリデーションを行う
 */
export const createSectorAveragesAggregate = (
  dataDate: string,
  sectorsDto: SectorAverageDataDto[],
): SectorAveragesAggregate => {
  return sectorAveragesAggregateSchema.parse({
    dataDate,
    sectors: sectorsDto,
  });
};
