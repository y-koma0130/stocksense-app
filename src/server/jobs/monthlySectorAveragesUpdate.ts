import fs from "fs";
import { inngest } from "../../../inngest/client";
import { createSectorAveragesAggregate } from "../features/marketData/domain/aggregates/sectorAverages";
import { parseJPXSectorAveragesFromBuffer } from "../features/marketData/infrastructure/externalServices/parseJPXSectorAverages";
import { saveSectorAverages } from "../features/marketData/infrastructure/repositories/saveSectorAverages.repository";

/**
 * 業種平均データ更新ジョブ（手動実行）
 *
 * JPX公式サイトから業種別平均PER/PBRをダウンロード・保存
 * https://www.jpx.co.jp/markets/statistics-equities/misc/04.html
 *
 * 使用方法: Inngest Dashboardから手動でトリガー、
 * または inngest.send({ name: "sector-averages/update" }) で実行
 */
export const monthlySectorAveragesUpdate = inngest.createFunction(
  {
    id: "monthly-sector-averages-update",
    name: "Sector Averages Update (Manual)",
    retries: 3,
  },
  { event: "sector-averages/update" }, // 手動イベントトリガー
  async ({ step }) => {
    // Step 1: JPX ExcelファイルをパースしてDTOを取得 + データ基準日を決定 + 集約を生成
    const aggregate = await step.run("create-sector-averages-aggregate", async () => {
      // プロジェクトルートからの絶対パス
      const filePath = `${process.cwd()}/data/sector_averages.xlsx`;

      // ファイルをバッファとして読み込み
      const fileBuffer = fs.readFileSync(filePath);

      // ExternalServiceからDTOを取得
      const sectorsDto = parseJPXSectorAveragesFromBuffer(fileBuffer);

      // データ基準日を決定（実行月の前月末）
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
      const dataDate = lastDayOfLastMonth.toISOString().split("T")[0];

      // 集約を生成（バリデーション含む）
      return createSectorAveragesAggregate(dataDate, sectorsDto);
    });

    // Step 2: 集約を永続化
    await step.run("save-sector-averages", async () => {
      await saveSectorAverages(aggregate);
    });

    return {
      message: "Sector averages updated successfully",
      dataDate: aggregate.dataDate,
      sectorCount: aggregate.sectors.length,
    };
  },
);
