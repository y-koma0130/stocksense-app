import { isNull } from "drizzle-orm";
import { inngest } from "../../../inngest/client";
import { db } from "../../db";
import { stocks } from "../../db/schema";
import { createScoringInput } from "../features/valueStockScoring/domain/entities/scoringInput";
import { calculateRSI } from "../features/valueStockScoring/domain/services/calculateRSI";
import { calculateTotalScore } from "../features/valueStockScoring/domain/services/scoreCalculators/calculateTotalScore";
import {
  LONG_TERM_CONFIG,
  SCORE_THRESHOLD,
} from "../features/valueStockScoring/domain/values/scoringConfig";
import { getDailyData } from "../features/valueStockScoring/infrastructure/externalServices/yahooFinance/getDailyData";
import { getFundamentals } from "../features/valueStockScoring/infrastructure/externalServices/yahooFinance/getFundamentals";
import { saveStockScore } from "../features/valueStockScoring/infrastructure/repositories/saveStockScore.repository";

/**
 * 週次スコアリングジョブ
 * 毎週土曜日0:00 (JST)に実行
 * 全銘柄に対して長期（週次）スコアを計算
 */
export const weeklyStockScoring = inngest.createFunction(
  {
    id: "weekly-stock-scoring",
    name: "Weekly Stock Scoring",
    retries: 3,
  },
  { cron: "TZ=Asia/Tokyo 0 0 * * 6" }, // 毎週土曜日0:00 JST
  async ({ step }) => {
    // ステップ1: 上場中の銘柄を取得
    const activeStocks = await step.run("fetch-active-stocks", async () => {
      return await db.select().from(stocks).where(isNull(stocks.deletedAt));
    });

    console.log(`Processing ${activeStocks.length} active stocks`);

    // ステップ2: 業種平均データを取得（最新）
    // TODO: 業種平均テーブルから最新データを取得
    // 現時点では空のMapを使用
    const sectorAverages = new Map<string, { avgPer: number; avgPbr: number }>();

    // ステップ3: バッチごとに銘柄を処理
    const batchSize = 50; // レート制限対策
    let totalHighScores = 0;
    let totalSaved = 0;

    for (let i = 0; i < activeStocks.length; i += batchSize) {
      const batch = activeStocks.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(activeStocks.length / batchSize);

      const batchResult = await step.run(`process-batch-${batchNumber}`, async () => {
        let highScoreCount = 0;
        let savedCount = 0;
        const scoreDate = new Date().toISOString().split("T")[0];

        for (const stock of batch) {
          try {
            // 基本データ取得（DTO）
            const fundamentals = await getFundamentals(stock.tickerSymbol);

            // 現在価格がない場合はスキップ
            if (!fundamentals.currentPrice) {
              console.log(`Skipping ${stock.tickerSymbol}: No price data`);
              continue;
            }

            // RSI計算用の日足データ取得（DTO）
            const dailyData = await getDailyData(stock.tickerSymbol, 30);
            const rsi = calculateRSI(dailyData, 14);

            // 業種平均データ取得
            const sectorAvg = stock.sectorCode ? sectorAverages.get(stock.sectorCode) : undefined;

            // エンティティ生成（バリデーション付き）
            const scoringInput = createScoringInput({
              tickerSymbol: stock.tickerSymbol,
              stockId: stock.id,
              currentPrice: fundamentals.currentPrice,
              per: fundamentals.per,
              pbr: fundamentals.pbr,
              rsi,
              fiftyTwoWeekHigh: fundamentals.fiftyTwoWeekHigh || fundamentals.currentPrice,
              fiftyTwoWeekLow: fundamentals.fiftyTwoWeekLow || fundamentals.currentPrice,
              sectorCode: stock.sectorCode,
              sectorAvgPer: sectorAvg?.avgPer ?? null,
              sectorAvgPbr: sectorAvg?.avgPbr ?? null,
            });

            // ドメインサービスでスコア計算 → 集約生成
            const stockScore = calculateTotalScore(scoringInput, LONG_TERM_CONFIG, "long_term");

            // 閾値以上のスコアのみ保存
            if (stockScore.totalScore >= SCORE_THRESHOLD) {
              highScoreCount++;
              try {
                // リポジトリで永続化
                await saveStockScore(stockScore, scoreDate);
                savedCount++;
              } catch (error) {
                // UNIQUE constraint違反などは無視
                console.error(`Error saving score for ${stock.tickerSymbol}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error processing ${stock.tickerSymbol}:`, error);
          }

          // レート制限対策: 100msの遅延
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        return { highScoreCount, savedCount };
      });

      totalHighScores += batchResult.highScoreCount;
      totalSaved += batchResult.savedCount;

      console.log(
        `Batch ${batchNumber}/${totalBatches}: Found ${batchResult.highScoreCount} high-score stocks, saved ${batchResult.savedCount}`,
      );
    }

    return {
      message: "Weekly scoring completed",
      processedStocks: activeStocks.length,
      highScoreStocks: totalHighScores,
      savedScores: totalSaved,
    };
  },
);
