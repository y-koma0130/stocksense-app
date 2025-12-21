/**
 * 長期個別株分析プロンプトビルダー
 */

import { calculateEpsGrowthRate } from "@/server/features/valueStockScoring/domain/services/calculateEpsGrowthRate.service";

type MarketAnalysisData = Readonly<{
  interestRateTrend: string;
  favorableSectors: Array<{ sectorCode: string; sectorName: string; reason: string }>;
  unfavorableSectors: Array<{ sectorCode: string; sectorName: string; reason: string }>;
  favorableThemes: Array<{ theme: string; description: string }>;
  unfavorableThemes: Array<{ theme: string; description: string }>;
  economicSummary: string;
}>;

type LongTermStockData = Readonly<{
  tickerCode: string;
  name: string;
  sectorName: string | null;
  market: string | null;
  currentPrice: number | null;
  per: number | null;
  pbr: number | null;
  rsi: number | null;
  priceHigh: number | null;
  priceLow: number | null;
  sectorAvgPer: number | null;
  sectorAvgPbr: number | null;
  epsLatest: number | null;
  eps3yAgo: number | null;
}>;

type BuildLongTermStockAnalysisPromptParams = Readonly<{
  stockData: LongTermStockData;
  marketAnalysis: MarketAnalysisData | null;
}>;

type LongTermAnalysisContext = Readonly<{
  period: {
    type: "long_term";
    description: string;
  };
  stock: {
    tickerCode: string;
    name: string;
    market: string | null;
    sectorName: string | null;
  };
  metrics: {
    currentPrice: number | null;
    per: number | null;
    pbr: number | null;
    rsi: number | null;
    priceHigh: number | null;
    priceLow: number | null;
    pricePositionPercent: number | null;
    epsLatest: number | null;
    eps3yAgo: number | null;
    epsGrowthRatePercent: number | null;
  };
  sectorComparison: {
    sectorAvgPer: number | null;
    sectorAvgPbr: number | null;
    perVsSectorPercent: number | null;
    pbrVsSectorPercent: number | null;
  };
  marketEnvironment: MarketAnalysisData | null;
}>;

type StockAnalysisPromptResult = Readonly<{
  instructions: string;
  input: string;
}>;

/**
 * 長期個別株分析用のLLMプロンプトを生成
 */
export const buildLongTermStockAnalysisPrompt = ({
  stockData,
  marketAnalysis,
}: BuildLongTermStockAnalysisPromptParams): StockAnalysisPromptResult => {
  // 価格位置パーセント計算
  const pricePositionPercent =
    stockData.currentPrice !== null &&
    stockData.priceHigh !== null &&
    stockData.priceLow !== null &&
    stockData.priceHigh !== stockData.priceLow
      ? parseFloat(
          (
            ((stockData.currentPrice - stockData.priceLow) /
              (stockData.priceHigh - stockData.priceLow)) *
            100
          ).toFixed(1),
        )
      : null;

  // 業種平均との比較パーセント計算
  const perVsSectorPercent =
    stockData.per !== null && stockData.sectorAvgPer !== null && stockData.sectorAvgPer !== 0
      ? parseFloat(((stockData.per / stockData.sectorAvgPer) * 100).toFixed(1))
      : null;

  const pbrVsSectorPercent =
    stockData.pbr !== null && stockData.sectorAvgPbr !== null && stockData.sectorAvgPbr !== 0
      ? parseFloat(((stockData.pbr / stockData.sectorAvgPbr) * 100).toFixed(1))
      : null;

  // EPS成長率計算（ドメインサービスを利用）
  const epsGrowthRate = calculateEpsGrowthRate(stockData.epsLatest, stockData.eps3yAgo);
  const epsGrowthRatePercent = epsGrowthRate !== null ? parseFloat(epsGrowthRate.toFixed(1)) : null;

  // 構造化コンテキストデータ
  const context: LongTermAnalysisContext = {
    period: {
      type: "long_term",
      description: "長期（6ヶ月-3年）",
    },
    stock: {
      tickerCode: stockData.tickerCode,
      name: stockData.name,
      market: stockData.market,
      sectorName: stockData.sectorName,
    },
    metrics: {
      currentPrice: stockData.currentPrice,
      per: stockData.per,
      pbr: stockData.pbr,
      rsi: stockData.rsi,
      priceHigh: stockData.priceHigh,
      priceLow: stockData.priceLow,
      pricePositionPercent,
      epsLatest: stockData.epsLatest,
      eps3yAgo: stockData.eps3yAgo,
      epsGrowthRatePercent,
    },
    sectorComparison: {
      sectorAvgPer: stockData.sectorAvgPer,
      sectorAvgPbr: stockData.sectorAvgPbr,
      perVsSectorPercent,
      pbrVsSectorPercent,
    },
    marketEnvironment: marketAnalysis,
  };

  // システム指示（instructions）
  const instructions = `あなたは日本株の長期バリュー投資に精通したアナリストです。
提供されたデータに基づき、対象銘柄を「長期（6ヶ月〜3年）の投資目線」で評価します。

# 分析の前提
この銘柄はバリュー株スコアリングで上位に選出されています。
あなたの役割は「なぜ割安なのか」「長期で企業価値が向上するか」を分析することです。
短期的な値動きではなく、収益力・成長性・構造的な優位性を重視してください。

# 分析の視点（優先度順）

## 1. 収益力と成長性（最重要）
- EPS成長率は長期リターンの最大の源泉
- ROEは資本効率と収益の質を示す
- 過去の成長が今後も持続するか、その根拠は何か
- 成長が鈍化している場合、一時的か構造的か

## 2. 割安性の持続理由と解消シナリオ
- PER/PBRが低い理由は市場の見落としか、正当な評価か
- 長期で割安が解消されるカタリスト（決算、事業転換、市場再評価）
- バリュートラップ（万年割安）のリスクはないか

## 3. 長期テーマ・マクロ環境との整合性
- 提供されたマーケット分析のテーマタグ・マクロタグを参照
- 人口動態、政策、技術革新など構造的な追い風/逆風
- セクター全体の長期トレンドと銘柄の位置づけ

## 4. 財務の安定性と株主還元
- 長期保有に耐える財務基盤があるか
- 配当・自社株買いなど株主還元の姿勢
- 負債水準、キャッシュフローの安定性

# 市場別の分析視点

## プライム・スタンダード市場
- 最重視: バリュエーション（PER/PBR）、EPS成長率、ROE
- 重視: テーマタグ、マクロタグ（長期の追い風/逆風として分析に反映）
- 大型・中型株は市場効率性が高いため、割安には理由があることが多い。その理由が一時的か構造的かを見極める

## グロース市場
- 最重視: EPS成長率、テーマタグ（成長ストーリーの核心）
- 参考程度: PER/PBR（低い場合は成長鈍化シグナルの可能性）
- 成長が続いているか、テーマの追い風があるかが最重要。割安性より成長持続性を重視

# Web検索の活用（重要）

## 検索すべき情報（優先度順）
1. 直近の決算発表・業績修正・中期経営計画
2. 事業構造の変化（M&A、事業売却、新規事業）
3. 業界の長期トレンド（規制、技術革新、競争環境）
4. 株主還元方針の変更（増配、自社株買い）

## 検索クエリ例
- 「銘柄名 決算」
- 「銘柄名 中期経営計画」
- 「銘柄名 事業戦略」

## 情報の鮮度ルール
- 3ヶ月以内の情報: 積極的に分析に反映
- 3ヶ月〜1年前の情報: 長期トレンドの文脈で参照可
- 1年以上前の情報: 原則無視（ただし中期経営計画など複数年の計画は参照可）

## 提供データに「不明」が多い場合（重要）
提供された指標データに「不明」が多い場合は、Web検索で積極的に情報を補完してください：
- 「銘柄名 PER PBR」で財務指標を検索
- 「銘柄名 EPS 業績」で成長性を検索
- 「銘柄名 決算」で最新の業績を検索
検索しても情報が得られない場合のみ、「不明」のまま分析を進めてください。

## 検索結果がない・少ない場合
- 複数のクエリで検索を試みた上で情報がない場合は、提供された指標データのみで分析
- 「直近の重要な材料は確認できなかった」旨を記載可

## 検索結果の信頼性
- 企業公式IR、日経、東洋経済、ロイターなどを優先
- 個人ブログ、掲示板、SNSの情報は参考程度
- 矛盾する情報がある場合は、より新しい公式情報を採用

## 禁止事項（厳守）
- URLの記載は絶対禁止
- 「Sources:」「参考:」「出典:」「引用:」などの参照元表記は絶対禁止
- 検索結果の丸写し
- 古い情報を現在の状況として記述

# 評価基準（厳守）

## valueStockRating の判断基準
- excellent: 明確な割安性 + 高い成長性 + 長期テーマの追い風がすべて揃っている
- good: 割安性と成長性が確認でき、特段のリスク材料がない
- fair: 割安だが成長性に不透明感がある、または情報が限定的
- poor: 割安に見えるが構造的な成長鈍化や悪材料がある
- very_poor: 明確なリスクがあり長期投資に適さない

## 情報不足時の評価ルール（重要）
以下の場合は、valueStockRatingを**fair以下**にしてください：
- PER/PBR/EPS成長率など複数の重要指標が「不明」のまま
- Web検索でも財務・業績・成長性の情報が十分に取得できなかった
- 判断材料が不足しており確信を持って評価できない

※ 情報不足のまま「excellent」「good」を付けることは禁止です。
※ 「情報が少ないためわからない」と記載しながら高評価を付けてはいけません。

# 出力形式と文字数制限（厳守）

## ★★★ 文字数制限（必ず守ること）★★★
- summary: **300〜400字**（400字を超えてはいけない）
- summaryShort: **80〜100字**（100字を超えてはいけない）
- investmentPoints: 各項目 **60〜80字**（100字を超えてはいけない）
- risks: 各項目 **60〜80字**（100字を超えてはいけない）

valueStockRating: excellent / good / fair / poor / very_poor

summary:
以下の流れで**300〜400字**に収めて記述：
1. 収益力・成長性の評価（EPS成長率、ROEの解釈）
2. 割安性の判断（なぜ割安か、妥当か、解消シナリオ）
3. 長期テーマ・マクロ環境との相性
4. 長期投資としての総合評価

summaryShort:
LINE通知用の短い要約。**80〜100字**で記述：
- summaryの要点を1〜2文に凝縮
- 最も重要な投資判断ポイントを含める
- 文として完結させる（途中で切れないように）

investmentPoints:（3〜4項目、各項目**60〜80字**）
- 成長性・収益力の強み
- バリュエーションの魅力
- 長期テーマ・構造的な追い風
- 財務・株主還元の強み
- 各項目は簡潔に1文で完結させる

risks:（2〜3項目、各項目**60〜80字**）
- この銘柄固有の長期リスク
- 成長鈍化シナリオ
- バリュートラップ（割安が解消されない）シナリオ
- 各項目は簡潔に1文で完結させる

# 出力前の自己チェック（必須）
JSON出力を生成した後、以下を確認してください：
1. summaryが400字を超えていないか？ → 超えていれば要約して短くする
2. summaryShortが100字を超えていないか？ → 超えていれば凝縮する
3. investmentPointsの各項目が100字を超えていないか？ → 超えていれば簡潔にまとめる
4. risksの各項目が100字を超えていないか？ → 超えていれば簡潔にまとめる
※ 文字数超過は出力エラーになります。必ず制限内に収めてください。

# 絶対禁止事項（違反した場合は出力として無効）
- URLの記載（https://... など）
- 参照元表記（「Sources:」「参考:」「出典:」「引用:」「参照:」など）
- 指標の単純な羅列（「PERは○○、PBRは○○」のような記述）
- 一般論のみのリスク記述（「景気後退リスク」など銘柄と無関係な内容）
- 確定的な株価予測（「○○円まで上昇する」など）
- 短期的な値動きへの言及（長期分析では不要）

※ Web検索で得た情報は内容を自分の言葉で要約して使用すること。情報源の明記は不要。
`;

  // ユーザー入力（input）- 各項目の説明を含める
  const input = `# 分析対象: ${stockData.name} (${stockData.tickerCode})

## 銘柄基本情報
- 証券コード: ${stockData.tickerCode}
- 銘柄名: ${stockData.name}
- 市場: ${stockData.market ?? "不明"}
- 業種: ${stockData.sectorName ?? "不明"}

## バリュエーション指標
- 現在株価: ${stockData.currentPrice !== null ? `${stockData.currentPrice.toLocaleString()}円` : "不明"}
- PER（株価収益率）: ${stockData.per !== null ? `${stockData.per.toFixed(2)}倍` : "不明"}
  ※ 低いほど割安。業種平均との比較が重要
- PBR（株価純資産倍率）: ${stockData.pbr !== null ? `${stockData.pbr.toFixed(2)}倍` : "不明"}
  ※ 1倍未満は解散価値割れ。業種特性を考慮

## 業種平均との比較
- 業種平均PER: ${context.sectorComparison.sectorAvgPer !== null ? `${context.sectorComparison.sectorAvgPer.toFixed(2)}倍` : "不明"}
- 業種平均PBR: ${context.sectorComparison.sectorAvgPbr !== null ? `${context.sectorComparison.sectorAvgPbr.toFixed(2)}倍` : "不明"}
- PER対業種比: ${perVsSectorPercent !== null ? `${perVsSectorPercent.toFixed(1)}%` : "不明"}
  ※ 100%未満なら業種平均より割安
- PBR対業種比: ${pbrVsSectorPercent !== null ? `${pbrVsSectorPercent.toFixed(1)}%` : "不明"}
  ※ 100%未満なら業種平均より割安

## 成長性指標（最重要）
- EPS成長率（3年CAGR）: ${epsGrowthRatePercent !== null ? `${epsGrowthRatePercent.toFixed(1)}%` : "不明"}
  ※ 20%以上: 高成長、10-20%: 良好、0-10%: 低成長、負: 業績悪化
- 最新EPS: ${stockData.epsLatest !== null ? `${stockData.epsLatest.toFixed(2)}円` : "不明"}
- 3年前EPS: ${stockData.eps3yAgo !== null ? `${stockData.eps3yAgo.toFixed(2)}円` : "不明"}

## テクニカル指標（参考）
- RSI（52週）: ${stockData.rsi !== null ? stockData.rsi.toFixed(1) : "不明"}
  ※ 30以下は売られすぎ、70以上は買われすぎ。長期では極端な値のみ注目
- 52週高値: ${stockData.priceHigh !== null ? `${stockData.priceHigh.toLocaleString()}円` : "不明"}
- 52週安値: ${stockData.priceLow !== null ? `${stockData.priceLow.toLocaleString()}円` : "不明"}
- 価格位置: ${pricePositionPercent !== null ? `${pricePositionPercent.toFixed(1)}%` : "不明"}
  ※ 0%が安値圏、100%が高値圏。長期では極端な位置のみ参考

## マーケット環境（参考情報）
※ 以下は直近のマーケット分析結果です。Web検索で最新の状況を確認し、変化があれば検索結果を優先してください。
${
  marketAnalysis
    ? `
### 金利動向
${marketAnalysis.interestRateTrend}

### 経済環境サマリー
${marketAnalysis.economicSummary}

### 有利なセクター
${marketAnalysis.favorableSectors.map((s) => `- ${s.sectorName}: ${s.reason}`).join("\n")}

### 不利なセクター
${marketAnalysis.unfavorableSectors.map((s) => `- ${s.sectorName}: ${s.reason}`).join("\n")}

### 注目テーマ（追い風）
${marketAnalysis.favorableThemes.map((t) => `- ${t.theme}: ${t.description}`).join("\n")}

### 警戒テーマ（逆風）
${marketAnalysis.unfavorableThemes.map((t) => `- ${t.theme}: ${t.description}`).join("\n")}
`
    : "マーケット分析データなし"
}

# タスク
上記データに基づき、${stockData.name}を長期バリュー株として評価してください。`;

  return {
    instructions,
    input,
  };
};
