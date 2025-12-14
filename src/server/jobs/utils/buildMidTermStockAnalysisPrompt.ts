/**
 * 中期個別株分析プロンプトビルダー
 */

type MarketAnalysisData = Readonly<{
  interestRateTrend: string;
  favorableSectors: Array<{ sectorCode: string; sectorName: string; reason: string }>;
  unfavorableSectors: Array<{ sectorCode: string; sectorName: string; reason: string }>;
  favorableThemes: Array<{ theme: string; description: string }>;
  unfavorableThemes: Array<{ theme: string; description: string }>;
  economicSummary: string;
}>;

type MidTermStockData = Readonly<{
  tickerCode: string;
  name: string;
  sectorName: string | null;
  market: string | null;
  currentPrice: number | null;
  per: number | null;
  pbr: number | null;
  rsi: number | null;
  rsiShort: number | null;
  priceHigh: number | null;
  priceLow: number | null;
  sectorAvgPer: number | null;
  sectorAvgPbr: number | null;
}>;

type BuildMidTermStockAnalysisPromptParams = Readonly<{
  stockData: MidTermStockData;
  marketAnalysis: MarketAnalysisData | null;
}>;

type MidTermAnalysisContext = Readonly<{
  period: {
    type: "mid_term";
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
    rsiShort: number | null;
    rsiMomentum: number | null;
    priceHigh: number | null;
    priceLow: number | null;
    pricePositionPercent: number | null;
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
 * 中期個別株分析用のLLMプロンプトを生成
 */
export const buildMidTermStockAnalysisPrompt = ({
  stockData,
  marketAnalysis,
}: BuildMidTermStockAnalysisPromptParams): StockAnalysisPromptResult => {
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

  // RSIモメンタム計算（短期RSI - 長期RSI）
  const rsiMomentum =
    stockData.rsiShort !== null && stockData.rsi !== null
      ? parseFloat((stockData.rsiShort - stockData.rsi).toFixed(1))
      : null;

  // 構造化コンテキストデータ
  const context: MidTermAnalysisContext = {
    period: {
      type: "mid_term",
      description: "中期（1-6ヶ月）",
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
      rsiShort: stockData.rsiShort,
      rsiMomentum,
      priceHigh: stockData.priceHigh,
      priceLow: stockData.priceLow,
      pricePositionPercent,
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
  const instructions = `あなたは日本株の中期バリュー投資に精通したアナリストです。
提供されたデータに基づき、対象銘柄を「中期（1〜6ヶ月）の投資目線」で評価します。

# 分析の前提
この銘柄はバリュー株スコアリングで上位に選出されています。
あなたの役割は「なぜ割安なのか」「今後上昇する可能性があるか」を分析することです。
単なる指標の説明ではなく、投資判断に役立つ洞察を提供してください。

# Web検索の活用（重要）

## 中期分析で重視すべき情報（優先度順）
1. 直近1ヶ月以内の決算発表・業績修正
2. 直近のIR・プレスリリース
3. 需給動向（信用残、外国人売買動向など）
4. セクター全体に影響する短期イベント（政策発表、為替変動など）
5. 突発的なリスク（不祥事、訴訟、事故、行政処分）

## 中期分析で影響され過ぎないこと
- 長期テーマや構造変化（中期では織り込み済みか見極める）
- 中期経営計画（1-6ヶ月で達成されるものではない）
- 5年後・10年後の成長ストーリー

## 検索クエリ例
- 「銘柄名 決算」
- 「銘柄名 業績」
- 「銘柄名 IR ニュース」

## 情報の鮮度ルール（厳守）
- 1ヶ月以内の情報: 積極的に分析に反映
- 1〜3ヶ月前の情報: 参考程度（状況が変わっている可能性を考慮）
- 3ヶ月以上前の情報: 原則無視（古すぎる）

## 提供データに「不明」が多い場合
Web検索で積極的に情報を補完してください：
- 「銘柄名 PER PBR」で財務指標を検索
- 「銘柄名 株価」で現在の株価を検索
- 「銘柄名 業績」で業績情報を検索
検索しても情報が得られない場合のみ、「不明」のまま分析を進めてください。

## 検索結果がない・少ない場合
複数のクエリで検索を試みた上で情報がない場合は、提供された指標データのみで分析してください。

## 検索結果の活用ルール
- 企業公式IR、日経、東洋経済、ロイターなどを優先
- 個人ブログ、掲示板、SNSの情報は参考程度
- 矛盾する情報がある場合は、より新しい公式情報を採用
- 検索結果は自分の言葉で要約して使用

# 分析の視点（優先度順）

## 1. 割安性の妥当性
- PER/PBRが業種平均より低い理由は何か
- 一時的な要因（業績下方修正、不祥事）か構造的な要因か
- 割安が解消される触媒（カタリスト）は何か

## 2. 需給・モメンタム
- RSIモメンタムが示す需給の方向性
- 価格位置から見た反発余地
- 出来高や市場の注目度の変化

## 3. マーケット環境との整合性
- 提供されたマーケット分析データを参照し、この銘柄のセクターが有利/不利か判断
- 金利動向、為替、政策テーマとの関連性
- セクター全体のトレンドと銘柄固有の動きの乖離

## 4. 中期での株価上昇シナリオ
- 1〜6ヶ月で株価が上昇するとすれば、どのような経路か
- 決算発表、セクターローテーション、需給改善など具体的なイベント

# 評価基準（厳守）

## valueStockRating の判断基準
- excellent: 明確な割安性 + 好材料 + 需給改善の兆候がすべて揃っている
- good: 割安性が確認でき、特段のリスク材料がない
- fair: 割安だが不透明な要素がある、または情報が限定的
- poor: 割安に見えるが構造的な問題や悪材料がある
- very_poor: 明確なリスクがあり投資推奨できない

## 情報不足時の評価ルール（重要）
以下の場合は、valueStockRatingを**fair以下**にしてください：
- PER/PBR/RSIなど複数の重要指標が「不明」のまま
- Web検索でも財務・業績情報が十分に取得できなかった
- 判断材料が不足しており確信を持って評価できない

※ 情報不足のまま「excellent」「good」を付けることは禁止です。

# 出力形式と文字数制限（厳守）

## 文字数制限
- summary: **300〜400字**（400字を超えない）
- investmentPoints: 各項目 **60〜80字**（100字を超えない）
- risks: 各項目 **60〜80字**（100字を超えない）

## 出力内容
valueStockRating: excellent / good / fair / poor / very_poor

summary:
1. 割安性の判断（なぜ割安か、妥当か）
2. 需給・モメンタムの状況
3. マーケット環境との相性
4. 中期投資としての総合評価

investmentPoints:（3〜4項目）
- 具体的な投資魅力を箇条書き
- 「割安である」だけでなく「なぜ今後解消されるか」の視点

risks:（2〜3項目）
- この銘柄固有のリスク
- 割安が解消されない（バリュートラップ）シナリオ

# 出力前の自己検証（必須）

JSON出力を生成した後、出力前に以下を必ず確認し、違反があれば修正してから出力してください。

## 1. 引用・参照のチェック（最優先）
出力テキスト全体をスキャンし、以下が含まれていたら削除してから出力：
- 「cite」「turn」「news」「search」を含む文字列（例: citeturn0news12）
- 「Sources:」「参考:」「出典:」「引用:」「参照:」
- URL（http://、https://で始まる文字列）
- 括弧内の出典表記（例: [1]、(日経新聞)）
- 「〜によると」という表現

## 2. 文字数チェック
- summary: 400字以内か？ → 超過なら要約して短縮
- investmentPoints: 各項目100字以内か？ → 超過なら簡潔にまとめる
- risks: 各項目100字以内か？ → 超過なら簡潔にまとめる

## 3. 内容チェック
- 数値の羅列になっていないか？ → 洞察を加えて書き直す
- 銘柄固有の内容になっているか？ → 一般論は削除

※ 検証で問題が見つかった場合は、必ず修正してから出力すること。
※ 引用マーカーが残っている出力は無効として扱われます。

# 絶対禁止事項
- URLの記載
- 引用マーカー・参照元表記
- 指標の単純な羅列
- 一般論のみのリスク記述
- 確定的な株価予測
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

## テクニカル・需給指標
- RSI（14週）: ${stockData.rsi !== null ? stockData.rsi.toFixed(1) : "不明"}
  ※ 30以下は売られすぎ、70以上は買われすぎ
- RSI（2週）: ${stockData.rsiShort !== null ? stockData.rsiShort.toFixed(1) : "不明"}
  ※ 短期の需給状況を示す
- RSIモメンタム: ${rsiMomentum !== null ? rsiMomentum.toFixed(1) : "不明"}
  ※ 2週RSI - 14週RSI。正なら反発初動、負なら調整継続
- 26週高値: ${stockData.priceHigh !== null ? `${stockData.priceHigh.toLocaleString()}円` : "不明"}
- 26週安値: ${stockData.priceLow !== null ? `${stockData.priceLow.toLocaleString()}円` : "不明"}
- 価格位置: ${pricePositionPercent !== null ? `${pricePositionPercent.toFixed(1)}%` : "不明"}
  ※ 0%が安値圏、100%が高値圏。低いほど反発余地あり

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
上記データに基づき、${stockData.name}を中期バリュー株として評価してください。`;

  return {
    instructions,
    input,
  };
};
