/**
 * フィルタ条件の型定義
 */
export type FilterConditions = Readonly<{
  sectorCodes?: string[];
  markets?: string[];
  macroTagIds?: string[];
  themeTagIds?: string[];
  priceRange?: Readonly<{
    min?: number;
    max?: number;
  }>;
}>;

/**
 * フィルタリストの型定義
 */
export type FilterList = Readonly<{
  id: string;
  name: string;
  filterConditions: FilterConditions;
  isNotificationTarget: boolean;
  createdAt: Date;
  updatedAt: Date;
}>;
