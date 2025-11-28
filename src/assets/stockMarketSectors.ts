/**
 * TOPIX 33業種分類マスタ
 * 日本取引所グループ（JPX）の業種分類に基づく
 */

export type SectorMasterData = {
  sectorCode: string;
  sectorName: string;
  displayOrder: number;
};

export const STOCK_MARKET_SECTORS: readonly SectorMasterData[] = [
  // 1. 水産・農林業
  { sectorCode: "0050", sectorName: "水産・農林業", displayOrder: 1 },

  // 2. 鉱業
  { sectorCode: "1050", sectorName: "鉱業", displayOrder: 2 },

  // 3. 建設業
  { sectorCode: "2050", sectorName: "建設業", displayOrder: 3 },

  // 4. 食料品
  { sectorCode: "3050", sectorName: "食料品", displayOrder: 4 },

  // 5. 繊維製品
  { sectorCode: "3100", sectorName: "繊維製品", displayOrder: 5 },

  // 6. パルプ・紙
  { sectorCode: "3150", sectorName: "パルプ・紙", displayOrder: 6 },

  // 7. 化学
  { sectorCode: "3200", sectorName: "化学", displayOrder: 7 },

  // 8. 医薬品
  { sectorCode: "3250", sectorName: "医薬品", displayOrder: 8 },

  // 9. 石油・石炭製品
  { sectorCode: "3300", sectorName: "石油・石炭製品", displayOrder: 9 },

  // 10. ゴム製品
  { sectorCode: "3350", sectorName: "ゴム製品", displayOrder: 10 },

  // 11. ガラス・土石製品
  { sectorCode: "3400", sectorName: "ガラス・土石製品", displayOrder: 11 },

  // 12. 鉄鋼
  { sectorCode: "3450", sectorName: "鉄鋼", displayOrder: 12 },

  // 13. 非鉄金属
  { sectorCode: "3500", sectorName: "非鉄金属", displayOrder: 13 },

  // 14. 金属製品
  { sectorCode: "3550", sectorName: "金属製品", displayOrder: 14 },

  // 15. 機械
  { sectorCode: "3600", sectorName: "機械", displayOrder: 15 },

  // 16. 電気機器
  { sectorCode: "3650", sectorName: "電気機器", displayOrder: 16 },

  // 17. 輸送用機器
  { sectorCode: "3700", sectorName: "輸送用機器", displayOrder: 17 },

  // 18. 精密機器
  { sectorCode: "3750", sectorName: "精密機器", displayOrder: 18 },

  // 19. その他製品
  { sectorCode: "3800", sectorName: "その他製品", displayOrder: 19 },

  // 20. 電気・ガス業
  { sectorCode: "4050", sectorName: "電気・ガス業", displayOrder: 20 },

  // 21. 陸運業
  { sectorCode: "5050", sectorName: "陸運業", displayOrder: 21 },

  // 22. 海運業
  { sectorCode: "5100", sectorName: "海運業", displayOrder: 22 },

  // 23. 空運業
  { sectorCode: "5150", sectorName: "空運業", displayOrder: 23 },

  // 24. 倉庫・運輸関連業
  { sectorCode: "5200", sectorName: "倉庫・運輸関連業", displayOrder: 24 },

  // 25. 情報・通信業
  { sectorCode: "5250", sectorName: "情報・通信業", displayOrder: 25 },

  // 26. 卸売業
  { sectorCode: "6050", sectorName: "卸売業", displayOrder: 26 },

  // 27. 小売業
  { sectorCode: "6100", sectorName: "小売業", displayOrder: 27 },

  // 28. 銀行業
  { sectorCode: "7050", sectorName: "銀行業", displayOrder: 28 },

  // 29. 証券、商品先物取引業
  { sectorCode: "7100", sectorName: "証券、商品先物取引業", displayOrder: 29 },

  // 30. 保険業
  { sectorCode: "7150", sectorName: "保険業", displayOrder: 30 },

  // 31. その他金融業
  { sectorCode: "7200", sectorName: "その他金融業", displayOrder: 31 },

  // 32. 不動産業
  { sectorCode: "8050", sectorName: "不動産業", displayOrder: 32 },

  // 33. サービス業
  { sectorCode: "9050", sectorName: "サービス業", displayOrder: 33 },
] as const;

/**
 * セクターコードからセクター名を取得
 */
export const getSectorName = (sectorCode: string): string | undefined => {
  return STOCK_MARKET_SECTORS.find((s) => s.sectorCode === sectorCode)?.sectorName;
};

/**
 * セクター名からセクターコードを取得
 */
export const getSectorCode = (sectorName: string): string | undefined => {
  return STOCK_MARKET_SECTORS.find((s) => s.sectorName === sectorName)?.sectorCode;
};

/**
 * すべてのセクターコードを取得
 */
export const getAllSectorCodes = (): readonly string[] => {
  return STOCK_MARKET_SECTORS.map((s) => s.sectorCode);
};
