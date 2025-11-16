import { isNull } from "drizzle-orm";
import { db } from "../../src/db";
import { stockScores, stocks } from "../../src/db/schema";
import { calculateRSI } from "../../src/lib/indicators/rsi";
import { calculateScore } from "../../src/lib/scoring/calculator";
import { MID_TERM_CONFIG, SCORE_THRESHOLD } from "../../src/lib/scoring/config";
import type { ScoringInput, ScoringResult } from "../../src/lib/scoring/types";
import { getFundamentals } from "../../src/lib/yahoo-finance/fundamentals";
import { getDailyData } from "../../src/lib/yahoo-finance/historical";
import { inngest } from "../client";

/**
 * 週次スコアリングジョブ
 * 毎週土曜日0:00 (JST)に実行
 * 全銘柄に対して中期（週次）スコアを計算
 */
export const weeklyScoring = inngest.createFunction(
  {
    id: "weekly-scoring",
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
    const highScoreResults: ScoringResult[] = [];

    for (let i = 0; i < activeStocks.length; i += batchSize) {
      const batch = activeStocks.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(activeStocks.length / batchSize);

      const batchResults = await step.run(`process-batch-${batchNumber}`, async () => {
        const results: ScoringResult[] = [];

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
            const sectorAvg = stock.sectorCode ? sectorAverages.get(stock.sectorCode) : undefined;

            // スコアリング入力データ作成
            const scoringInput: ScoringInput = {
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
            };

            // スコア計算
            const scoreResult = calculateScore(scoringInput, MID_TERM_CONFIG, "mid_term");

            // 閾値以上のスコアのみ保存
            if (scoreResult.totalScore >= SCORE_THRESHOLD) {
              results.push(scoreResult);
            }
          } catch (error) {
            console.error(`Error processing ${stock.tickerSymbol}:`, error);
          }

          // レート制限対策: 100msの遅延
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        return results;
      });

      highScoreResults.push(...batchResults);

      console.log(
        `Batch ${batchNumber}/${totalBatches}: Found ${batchResults.length} high-score stocks`,
      );
    }

    // ステップ4: スコアをデータベースに保存
    const savedCount = await step.run("save-scores", async () => {
      const today = new Date();
      const scoreDate = today.toISOString().split("T")[0];

      let count = 0;
      for (const result of highScoreResults) {
        try {
          await db.insert(stockScores).values({
            stockId: result.stockId,
            scoreDate,
            scoreType: result.scoreType,
            perScore: result.perScore,
            pbrScore: result.pbrScore,
            rsiScore: result.rsiScore,
            priceRangeScore: result.priceRangeScore,
            sectorScore: result.sectorScore,
            totalScore: result.totalScore.toString(),
          });
          count++;
        } catch (error) {
          // UNIQUE constraint違反などは無視
          console.error(`Error saving score for ${result.tickerSymbol}:`, error);
        }
      }

      return count;
    });

    return {
      message: "Weekly scoring completed",
      processedStocks: activeStocks.length,
      highScoreStocks: highScoreResults.length,
      savedScores: savedCount,
    };
  },
);
