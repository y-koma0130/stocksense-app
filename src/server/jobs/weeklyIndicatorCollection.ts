import { inngest } from "../../../inngest/client";
import { getActiveStocks } from "../features/marketData/infrastructure/queryServices/getActiveStocks.queryService";
import { getLatestSectorAverages } from "../features/marketData/infrastructure/queryServices/getLatestSectorAverages.queryService";
import { createStockIndicator } from "../features/valueStockScoring/domain/entities/stockIndicator";
import { calculateRSI } from "../features/valueStockScoring/domain/services/calculateRSI";
import { getDailyData } from "../features/valueStockScoring/infrastructure/externalServices/yahooFinance/getDailyData";
import { getFundamentals } from "../features/valueStockScoring/infrastructure/externalServices/yahooFinance/getFundamentals";
import { saveStockIndicator } from "../features/valueStockScoring/infrastructure/repositories/saveStockIndicator.repository";

/**
 * 週次指標収集ジョブ
 * 毎週土曜日0:00 (JST)に実行
 * 全銘柄の指標データを収集してDBに保存
 */
export const weeklyIndicatorCollection = inngest.createFunction(
  {
    id: "weekly-indicator-collection",
    name: "Weekly Indicator Collection",
    retries: 3,
  },
  { cron: "TZ=Asia/Tokyo 0 0 * * 6" }, // 毎週土曜日0:00 JST
  async ({ step }) => {
    // ステップ1: 上場中の銘柄を取得
    const activeStocks = await step.run("fetch-active-stocks", async () => {
      return await getActiveStocks();
    });

    console.log(`Processing ${activeStocks.length} active stocks`);

    // ステップ2: 業種平均データを取得
    const sectorAverages = await step.run("fetch-sector-averages", async () => {
      return await getLatestSectorAverages();
    });

    // ステップ3: バッチごとに銘柄を処理
    const batchSize = 50; // レート制限対策
    let totalCollected = 0;
    let totalSaved = 0;

    for (let i = 0; i < activeStocks.length; i += batchSize) {
      const batch = activeStocks.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(activeStocks.length / batchSize);

      const batchResult = await step.run(`process-batch-${batchNumber}`, async () => {
        let collectedCount = 0;
        let savedCount = 0;
        const collectedAt = new Date().toISOString().split("T")[0];

        for (const stock of batch) {
          try {
            // 基本データ取得
            const fundamentals = await getFundamentals(stock.tickerSymbol);

            // 現在価格がない場合はスキップ
            if (!fundamentals.currentPrice) {
              console.log(`Skipping ${stock.tickerSymbol}: No price data`);
              continue;
            }

            // RSI計算用の日足データ取得
            const dailyData = await getDailyData(stock.tickerSymbol, 30);
            const rsi = calculateRSI(dailyData, 14);

            // 業種平均データ取得
            const sectorAvg = stock.sectorCode
              ? sectorAverages.find((s) => s.sectorCode === stock.sectorCode)
              : undefined;

            // エンティティ生成
            const indicator = createStockIndicator({
              stockId: stock.id,
              collectedAt,
              periodType: "weekly",
              currentPrice: fundamentals.currentPrice,
              per: fundamentals.per,
              pbr: fundamentals.pbr,
              rsi,
              week52High: fundamentals.fiftyTwoWeekHigh,
              week52Low: fundamentals.fiftyTwoWeekLow,
              sectorCode: stock.sectorCode,
              sectorAvgPer: sectorAvg?.avgPer ?? null,
              sectorAvgPbr: sectorAvg?.avgPbr ?? null,
            });

            collectedCount++;

            try {
              // リポジトリで永続化
              await saveStockIndicator(indicator);
              savedCount++;
            } catch (error) {
              // UNIQUE constraint違反などは無視
              console.error(`Error saving indicator for ${stock.tickerSymbol}:`, error);
            }
          } catch (error) {
            console.error(`Error processing ${stock.tickerSymbol}:`, error);
          }

          // レート制限対策: 200msの遅延
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        return { collectedCount, savedCount };
      });

      totalCollected += batchResult.collectedCount;
      totalSaved += batchResult.savedCount;

      console.log(
        `Batch ${batchNumber}/${totalBatches}: Collected ${batchResult.collectedCount} indicators, saved ${batchResult.savedCount}`,
      );
    }

    return {
      message: "Weekly indicator collection completed",
      processedStocks: activeStocks.length,
      collectedIndicators: totalCollected,
      savedIndicators: totalSaved,
    };
  },
);
