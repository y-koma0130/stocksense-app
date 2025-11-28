/**
 * マーケット分析プロンプトの生成
 */

import { STOCK_MARKET_SECTORS } from "@/assets/stockMarketSectors";
import type { PeriodType } from "../../features/marketAnalysis/domain/values/types";

type BuildMarketAnalysisPromptParams = Readonly<{
  periodType: PeriodType;
}>;

/**
 * マーケット分析用のLLMプロンプトを生成
 */
export const buildMarketAnalysisPrompt = ({
  periodType,
}: BuildMarketAnalysisPromptParams): string => {
  const periodDescription = periodType === "mid_term" ? "中期（1ヶ月〜半年）" : "長期（半年〜3年）";

  const sectorListText = STOCK_MARKET_SECTORS.map((s) => `- ${s.sectorCode}: ${s.sectorName}`).join(
    "\n",
  );

  return `あなたは日本株のバリュー投資を専門とするアナリストです。
現在の日本株市場における${periodDescription}の投資環境を分析してください。

# 分析期間
${periodDescription}の投資目線で分析してください。

# 分析項目

## 1. 金利動向分析
- 日銀の金融政策動向
- 米国金利の影響
- 金利環境が日本株市場に与える影響
- 500文字以内で簡潔に記述

# 分析方針（必ず守ること）
- 短期イベント（FOMC直後の反応、日銀会合の当日影響など）に過度に依存した分析は避け、
  中期・長期で持続性のある「政策の方向性」「需給トレンド」「企業業績の波及」を重視すること。
- 中期は「1〜2四半期先の業績反映」、長期は「構造的テーマ・設備投資・人口動態・地政学」などを優先すること。


## 2. 注目セクター（3-5件）
${periodDescription}の期間で注目すべきセクターを3-5件挙げてください。
各セクターについて:
- sectorCode: 下記のTOPIX 33業種コードから選択
- sectorName: セクター名
- reason: 注目理由（80文字以内）

## 3. 注意セクター（2-3件）
${periodDescription}の期間で注意が必要なセクターを2-3件挙げてください。
各セクターについて:
- sectorCode: 下記のTOPIX 33業種コードから選択
- sectorName: セクター名
- reason: 注意理由（80文字以内）

## 4. 注目テーマ・事業内容（3-5件）
セクターよりも細かい粒度での注目テーマ・事業内容を3-5件挙げてください。
例: 「生成AI関連」「半導体製造装置」「インバウンド関連」など
各テーマについて:
- theme: テーマ名（50文字以内）
- description: 説明（100文字以内）

## 5. 注意テーマ・事業内容（2-3件）
注意が必要なテーマ・事業内容を2-3件挙げてください。
例: 「暗号資産関連」「中国依存度の高い事業」など
各テーマについて:
- theme: テーマ名（50文字以内）
- description: 説明（100文字以内）

## 6. 経済・マーケット総括
${periodDescription}の日本株市場の展望を500文字以内で総括してください。
総括は以下の観点を網羅すること：
- 金利・為替の方向性
- 企業業績の見通し（EPSトレンド）
- セクター間ローテーション
- 投資スタンス（バリュー/グロース/内需/外需）

# TOPIX 33業種コード一覧
${sectorListText}

# 重要な注意事項
- periodTypeは必ず "${periodType}" を設定してください
- セクターコードは上記のTOPIX 33業種コード一覧から正確に選択してください
- 注目セクターと注意セクターで同じsectorCodeを選ばないこと
- 各項目の文字数制限を厳守してください
- **引用情報は出力に含めないこと**: ウェブ検索結果の引用マーカー（cite、turnなど）を一切含めず、純粋な分析文のみを出力してください

# セクター選定基準
以下のいずれかに該当するセクターを優先して選ぶこと：
- 中期/長期で業績に追い風のマクロ要因がある
- 資金流入が継続しやすい
- 構造的な成長ドライバーがある
- 金利・為替・設備投資の影響を受け、業績変化が読みやすい
`;
};
