import type { MarketValue } from "@/assets/marketOptions";
import type { SectorCode } from "@/assets/stockMarketSectors";

/**
 * フィルタ条件の型定義
 * バックエンドのDTOと一致させる
 */
export type FilterConditions = Readonly<{
  markets: MarketValue[] | null;
  sectorCodes: SectorCode[] | null;
  priceRange: Readonly<{
    min: number | null;
    max: number | null;
  }> | null;
}>;

/**
 * フィルタリストの型定義
 * バックエンドのDTOと一致させる
 */
export type FilterList = Readonly<{
  id: string;
  name: string;
  filterConditions: FilterConditions;
  createdAt: Date;
  updatedAt: Date;
}>;
