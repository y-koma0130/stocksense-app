import type { MarketValue } from "@/assets/marketOptions";
import type { SectorCode } from "@/assets/stockMarketSectors";
import type { FilterListEntity } from "../../domain/entities/filterList";

/**
 * フィルターリストDTO
 * フロントエンドに返却するデータ形式
 */
export type FilterListDto = Readonly<{
  id: string;
  name: string;
  filterConditions: Readonly<{
    markets: MarketValue[] | null;
    sectorCodes: SectorCode[] | null;
    priceRange: Readonly<{
      min: number | null;
      max: number | null;
    }> | null;
  }>;
  createdAt: Date;
  updatedAt: Date;
}>;

/**
 * エンティティからDTOに変換
 */
export const toFilterListDto = (entity: FilterListEntity): FilterListDto => {
  const hasPriceRange = entity.priceMin !== null || entity.priceMax !== null;

  return {
    id: entity.id,
    name: entity.name,
    filterConditions: {
      markets: entity.markets,
      sectorCodes: entity.sectorCodes,
      priceRange: hasPriceRange
        ? {
            min: entity.priceMin,
            max: entity.priceMax,
          }
        : null,
    },
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
};

/**
 * 通知設定DTO
 */
export type NotificationSettingsDto = Readonly<{
  notificationTargetListId: string | null;
}>;

/**
 * フィルターリストデータ（ジョブ用の軽量DTO）
 * クエリサービスやジョブで使用する最小限のフィルター条件データ
 */
export type FilterListDataDto = Readonly<{
  id: string;
  name: string;
  markets: string[] | null;
  sectorCodes: string[] | null;
  priceMin: number | null;
  priceMax: number | null;
}>;
