import { inngest } from "../../../inngest/client";
import { getActiveStocks } from "../features/marketData/infrastructure/queryServices/getActiveStocks.queryService";
import { createStockFinancialHealth } from "../features/valueStockScoring/domain/entities/stockFinancialHealth";
import { getFinancialHealth } from "../features/valueStockScoring/infrastructure/externalServices/yahooFinance/getFinancialHealth";
import { upsertStockFinancialHealth } from "../features/valueStockScoring/infrastructure/repositories/upsertStockFinancialHealth.repository";

/**
 * 月次財務健全性データ収集ジョブ
 * 毎月1日6:00 (JST)に実行（指標収集ジョブの6時間後）
 * 全銘柄の財務健全性データを収集してDBにUPSERT
 */
export const monthlyFinancialHealthCollection = inngest.createFunction(
  {
    id: "monthly-financial-health-collection",
    name: "Monthly Financial Health Collection",
    retries: 3,
  },
  { cron: "TZ=Asia/Tokyo 0 6 1 * *" }, // 毎月1日6:00 JST
  async ({ step }) => {
    // ステップ1: 上場中の銘柄を取得
    const activeStocks = await step.run("fetch-active-stocks", async () => {
      return await getActiveStocks();
    });

    console.log(`Processing ${activeStocks.length} active stocks for financial health`);

    // ステップ2: バッチごとに銘柄を処理
    const batchSize = 30;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    for (let i = 0; i < activeStocks.length; i += batchSize) {
      const batch = activeStocks.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(activeStocks.length / batchSize);

      const batchResult = await step.run(`process-batch-${batchNumber}`, async () => {
        let updatedCount = 0;
        let skippedCount = 0;
        let failedCount = 0;

        for (const stock of batch) {
          try {
            // 財務健全性データを取得
            const financialHealth = await getFinancialHealth(stock.tickerSymbol);

            // データが取得できた場合のみ更新
            if (
              financialHealth.equityRatio !== null ||
              financialHealth.operatingIncomeDeclineYears !== null ||
              financialHealth.operatingCashFlowNegativeYears !== null
            ) {
              // エンティティ生成（バリデーション付き）
              const entity = createStockFinancialHealth({
                stockId: stock.id,
                equityRatio: financialHealth.equityRatio,
                operatingIncomeDeclineYears: financialHealth.operatingIncomeDeclineYears,
                operatingCashFlowNegativeYears: financialHealth.operatingCashFlowNegativeYears,
              });

              // リポジトリで永続化
              await upsertStockFinancialHealth(entity);
              updatedCount++;
            } else {
              console.log(`Skipping ${stock.tickerSymbol}: No financial health data available`);
              skippedCount++;
            }
          } catch (error) {
            console.error(`Error processing financial health for ${stock.tickerSymbol}:`, error);
            failedCount++;
          }

          // レート制限対策: 300msの遅延
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        return { updatedCount, skippedCount, failedCount };
      });

      totalUpdated += batchResult.updatedCount;
      totalSkipped += batchResult.skippedCount;
      totalFailed += batchResult.failedCount;

      console.log(
        `Batch ${batchNumber}/${totalBatches}: Updated ${batchResult.updatedCount}, Skipped ${batchResult.skippedCount}, Failed ${batchResult.failedCount}`,
      );
    }

    return {
      message: "Monthly financial health collection completed",
      processedStocks: activeStocks.length,
      updatedStocks: totalUpdated,
      skippedStocks: totalSkipped,
      failedStocks: totalFailed,
    };
  },
);
