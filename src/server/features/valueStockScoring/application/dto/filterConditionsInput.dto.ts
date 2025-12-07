// TODO: 配置場所検討 - 他のユースケースでも同様のパターンで実装しているため、共通化の検討

/**
 * ランキング取得時のフィルタ条件DTO
 */
export type FilterConditionsInputDto = Readonly<{
  sectorCodes?: string[];
  markets?: string[];
  macroTagIds?: string[];
  themeTagIds?: string[];
  priceRange?: Readonly<{
    min?: number;
    max?: number;
  }>;
}>;
