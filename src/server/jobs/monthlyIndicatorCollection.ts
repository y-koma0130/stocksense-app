import { inngest } from "../../../inngest/client";
import { getActiveStocks } from "../features/marketData/infrastructure/queryServices/getActiveStocks";
import { createLongTermIndicator } from "../features/valueStockScoring/domain/entities/longTermIndicator";
import { calculateAvgDailyVolume } from "../features/valueStockScoring/domain/services/calculateAvgDailyVolume.service";
import { calculateRSI } from "../features/valueStockScoring/domain/services/calculateRSI";
import { VOLUME_PERIOD } from "../features/valueStockScoring/domain/values/volumeConfig";
import { getFundamentals } from "../features/valueStockScoring/infrastructure/externalServices/yahooFinance/getFundamentals";
import { getWeeklyData } from "../features/valueStockScoring/infrastructure/externalServices/yahooFinance/getWeeklyData";
import { saveLongTermIndicator } from "../features/valueStockScoring/infrastructure/repositories/saveLongTermIndicator.repository";

/**
 * 長期指標収集ジョブ（旧: 月次）
 * 毎月1日0:00 (JST)に実行
 * 全銘柄の長期指標データ（52週レンジ、52週RSI）を収集してDBに保存
 */
export const monthlyIndicatorCollection = inngest.createFunction(
  {
    id: "long-term-indicator-collection",
    name: "Long-Term Indicator Collection",
    retries: 3,
  },
  { cron: "TZ=Asia/Tokyo 0 0 1 * *" }, // 毎月1日0:00 JST（財務健全性収集と同時実行）
  async ({ step }) => {
    // ステップ1: 上場中の銘柄を取得
    const activeStocks = await step.run("fetch-active-stocks", async () => {
      return await getActiveStocks();
    });

    console.log(`Processing ${activeStocks.length} active stocks`);

    // ステップ2: バッチごとに銘柄を処理
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

            // 週足データ取得（52週分 + 余裕）
            const weeklyData = await getWeeklyData(stock.tickerSymbol, 60);

            // 52週RSI計算
            const rsi = calculateRSI(weeklyData, 52);

            // 52週の高値・安値を計算
            const last52Weeks = weeklyData.slice(0, 52);
            const priceHigh =
              last52Weeks.length > 0 ? Math.max(...last52Weeks.map((d) => d.high)) : null;
            const priceLow =
              last52Weeks.length > 0 ? Math.min(...last52Weeks.map((d) => d.low)) : null;

            // 出来高計算（短期のみ、罠株除外用）
            const avgVolumeShort = calculateAvgDailyVolume(weeklyData, VOLUME_PERIOD.SHORT);

            // エンティティ生成
            const indicator = createLongTermIndicator({
              stockId: stock.id,
              collectedAt,
              currentPrice: fundamentals.currentPrice,
              per: fundamentals.per,
              pbr: fundamentals.pbr,
              rsi,
              priceHigh,
              priceLow,
              avgVolumeShort,
              sectorCode: stock.sectorCode,
            });

            collectedCount++;

            try {
              // リポジトリで永続化
              await saveLongTermIndicator(indicator);
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
      message: "Long-term indicator collection completed",
      processedStocks: activeStocks.length,
      collectedIndicators: totalCollected,
      savedIndicators: totalSaved,
    };
  },
);
