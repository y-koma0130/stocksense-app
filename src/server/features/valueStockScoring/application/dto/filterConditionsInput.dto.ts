/**
 * ランキング取得時のフィルタ条件DTO
 * FilterListDto.filterConditionsと同じ型を使用し、フロントから直接渡せるようにする
 */
export type FilterConditionsInputDto = Readonly<{
  sectorCodes?: string[] | null;
  markets?: string[] | null;
  priceRange?: Readonly<{
    min: number | null;
    max: number | null;
  }> | null;
}>;
