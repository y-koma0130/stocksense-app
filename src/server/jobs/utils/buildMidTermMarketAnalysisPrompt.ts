/**
 * 中期マーケット分析プロンプトの生成
 * 1ヶ月〜半年の投資目線での分析
 *
 * TODO: favorableThemes/unfavorableThemes と favorableThemeTags の役割を整理する
 * - favorableThemes: LLMが自由記述した注目テーマ（LINE通知、個別株分析コンテキストで使用中）
 * - favorableThemeTags: 事前定義されたタグIDから選択（スコアリングで使用予定）
 * 現在は併存しているが、将来的に統一するか役割を明確に分けるか検討が必要
 */

import { STOCK_MARKET_SECTORS } from "@/assets/stockMarketSectors";

/**
 * 中期マーケット分析用のプロンプト構造
 */
export type MidTermMarketAnalysisPrompt = Readonly<{
  /** マスタデータコンテキスト（developerロールで渡す） */
  context: string;
  /** 分析指示（userロールで渡す） */
  instruction: string;
}>;

/**
 * セクターマスタデータのコンテキストを生成
 */
const buildSectorContext = (): string => {
  const sectorListText = STOCK_MARKET_SECTORS.map((s) => `- ${s.sectorCode}: ${s.sectorName}`).join(
    "\n",
  );

  return `# マスタデータ

## TOPIX 33業種コード一覧
セクターの選択には、以下のマスタデータを参照してください。
${sectorListText}`;
};

/**
 * 中期マーケット分析の指示を生成
 */
const buildInstruction = (): string => {
  return `現在の日本株市場における中期（1ヶ月〜半年）の投資環境を分析してください。

# 分析期間
中期（1ヶ月〜半年）の投資目線で分析してください。

# 分析方針（必ず守ること）
- 短期イベント（FOMC直後の反応、日銀会合の当日影響など）に過度に依存した分析は避けること
- **1〜2四半期先の業績反映**を重視すること
- 需給トレンドと企業業績の波及を重視すること
- 決算発表サイクルを意識した分析を行うこと

# 分析項目

## 1. 金利動向分析
以下の観点で分析してください（400文字以内、厳守）：
- 日銀の金融政策の方向性（次回会合での利上げ可能性など）
- 米国金利の短期的な動向と日本株への影響
- 金利環境が各セクターに与える影響

## 2. 注目セクター（3-5件）
中期（1ヶ月〜半年）で注目すべきセクターを3-5件挙げてください。
選定基準：
- 直近の決算で業績改善が確認されたセクター
- 1〜2四半期先の業績上振れが期待できるセクター
- 資金流入が継続しやすいセクター

各セクターについて:
- sectorCode: コンテキストのTOPIX 33業種コードから選択
- sectorName: セクター名
- reason: 注目理由（60文字以内、厳守）

## 3. 注意セクター（2-3件）
中期（1ヶ月〜半年）で注意が必要なセクターを2-3件挙げてください。
選定基準：
- 業績下方修正リスクがあるセクター
- 需要減退の兆候があるセクター
- 為替・金利変動の悪影響を受けやすいセクター

各セクターについて:
- sectorCode: コンテキストのTOPIX 33業種コードから選択
- sectorName: セクター名
- reason: 注意理由（60文字以内、厳守）

## 4. 注目テーマ・事業内容（3-5件）
セクターよりも細かい粒度での注目テーマを3-5件挙げてください。
例: 「生成AI関連」「半導体製造装置」「インバウンド関連」「自動車部品」など
選定基準：
- 直近で受注・売上増加が確認されているテーマ
- 決算発表で好業績が期待されるテーマ

各テーマについて:
- theme: テーマ名（30文字以内、厳守）
- description: 説明（80文字以内、厳守）

## 5. 注意テーマ・事業内容（2-3件）
注意が必要なテーマを2-3件挙げてください。
例: 「暗号資産関連」「中国依存度の高い事業」「不動産開発」など

各テーマについて:
- theme: テーマ名（30文字以内、厳守）
- description: 説明（80文字以内、厳守）

## 6. 経済・マーケット総括
中期（1ヶ月〜半年）の日本株市場の展望を400文字以内（厳守）で総括してください。
以下の観点を網羅すること：
- 金利・為替の短期的な方向性
- 今後1〜2四半期の企業業績見通し
- セクター間ローテーションの方向性
- 推奨する投資スタンス（バリュー/グロース/内需/外需）

# 出力形式
- 出力はシステムから提供されるレスポンススキーマに厳密に従ってください
- 以下のフィールドを含むJSONオブジェクトを出力してください：
  - periodType: "mid_term"
  - interestRateTrend: 金利動向分析（400文字以内）
  - favorableSectors: 注目セクターの配列（reason: 60文字以内）
  - unfavorableSectors: 注意セクターの配列（reason: 60文字以内）
  - favorableThemes: 注目テーマの配列（theme: 30文字以内, description: 80文字以内）
  - unfavorableThemes: 注意テーマの配列（theme: 30文字以内, description: 80文字以内）
  - economicSummary: 経済・マーケット総括（400文字以内）

# 重要な注意事項
- periodTypeは必ず "mid_term" を設定してください
- セクターコードはコンテキストのマスタデータから正確に選択してください
- 注目セクターと注意セクターで同じsectorCodeを選ばないこと
- 各項目の文字数制限を厳守してください
- **引用情報は出力に含めないこと**: ウェブ検索結果の引用マーカー（cite、turnなど）を一切含めず、純粋な分析文のみを出力してください`;
};

/**
 * 中期マーケット分析用のLLMプロンプトを生成
 */
export const buildMidTermMarketAnalysisPrompt = (): MidTermMarketAnalysisPrompt => {
  return {
    context: buildSectorContext(),
    instruction: buildInstruction(),
  };
};
