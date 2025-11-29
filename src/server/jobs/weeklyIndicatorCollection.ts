import { inngest } from "../../../inngest/client";
import { getActiveStocks } from "../features/marketData/infrastructure/queryServices/getActiveStocks";
import { createMidTermIndicator } from "../features/valueStockScoring/domain/entities/midTermIndicator";
import { calculateRSI } from "../features/valueStockScoring/domain/services/calculateRSI";
import { getFundamentals } from "../features/valueStockScoring/infrastructure/externalServices/yahooFinance/getFundamentals";
import { getWeeklyData } from "../features/valueStockScoring/infrastructure/externalServices/yahooFinance/getWeeklyData";
import { saveMidTermIndicator } from "../features/valueStockScoring/infrastructure/repositories/saveMidTermIndicator.repository";

/**
 * 中期指標収集ジョブ（旧: 週次）
 * 毎週土曜日0:00 (JST)に実行
 * 全銘柄の中期指標データ（26週レンジ、14週RSI）を収集してDBに保存
 */
export const weeklyIndicatorCollection = inngest.createFunction(
  {
    id: "mid-term-indicator-collection",
    name: "Mid-Term Indicator Collection",
    retries: 3,
  },
  { cron: "TZ=Asia/Tokyo 0 0 * * 6" }, // 毎週土曜日0:00 JST
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

            // 週足データ取得（26週分 + 余裕）
            const weeklyData = await getWeeklyData(stock.tickerSymbol, 30);

            // 14週RSI計算（ベース）
            const rsi = calculateRSI(weeklyData, 14);

            // 2週RSI計算（短期モメンタム用）
            const rsiShort = calculateRSI(weeklyData, 2);

            // 26週の高値・安値を計算
            const last26Weeks = weeklyData.slice(0, 26);
            const priceHigh =
              last26Weeks.length > 0 ? Math.max(...last26Weeks.map((d) => d.high)) : null;
            const priceLow =
              last26Weeks.length > 0 ? Math.min(...last26Weeks.map((d) => d.low)) : null;

            // エンティティ生成
            const indicator = createMidTermIndicator({
              stockId: stock.id,
              collectedAt,
              currentPrice: fundamentals.currentPrice,
              per: fundamentals.per,
              pbr: fundamentals.pbr,
              rsi,
              rsiShort,
              priceHigh,
              priceLow,
              sectorCode: stock.sectorCode,
            });

            collectedCount++;

            try {
              // リポジトリで永続化
              await saveMidTermIndicator(indicator);
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
      message: "Mid-term indicator collection completed",
      processedStocks: activeStocks.length,
      collectedIndicators: totalCollected,
      savedIndicators: totalSaved,
    };
  },
);
