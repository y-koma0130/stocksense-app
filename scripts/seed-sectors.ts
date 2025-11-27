/**
 * セクターマスタをDBに投入するシードスクリプト
 *
 * 実行方法:
 * npx tsx scripts/seed-sectors.ts
 */

import { STOCK_MARKET_SECTORS } from "@/assets/stockMarketSectors";
import { db } from "@/db";
import { sectors } from "@/db/schema";

const seedSectors = async () => {
  console.log("🌱 セクターマスタのシードを開始します...");

  try {
    // 既存データを削除
    console.log("既存のセクターデータを削除中...");
    await db.delete(sectors);

    // 新しいデータを挿入
    console.log(`${STOCK_MARKET_SECTORS.length}件のセクターデータを挿入中...`);

    const insertData = STOCK_MARKET_SECTORS.map((sector) => ({
      sectorCode: sector.sectorCode,
      sectorName: sector.sectorName,
      displayOrder: sector.displayOrder,
    }));

    await db.insert(sectors).values(insertData);

    console.log("✅ セクターマスタのシード完了！");
    console.log(`   挿入件数: ${STOCK_MARKET_SECTORS.length}件`);

    process.exit(0);
  } catch (error) {
    console.error("❌ セクターマスタのシードに失敗しました:", error);
    process.exit(1);
  }
};

seedSectors();
