# StockSense スコアリング機能 実装タスク

## 🎯 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React 19, Panda CSS
- **バックエンド**: tRPC, Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **ジョブ管理**: Inngest (週次・月次ジョブ)
- **デプロイ**: Vercel
- **データソース**: Yahoo Finance API, JPX公式データ

---

## 📦 必要なライブラリ

### 既存（インストール済み）

```json
{
  "yahoo-finance2": "3.10.1",
  "@supabase/supabase-js": "^2.x",
  "@trpc/server": "^11.x",
  "@trpc/client": "^11.x",
  "@trpc/react-query": "^11.x",
  "@tanstack/react-query": "^5.x",
  "zod": "^4.x",
  "superjson": "^2.x"
}
```

### 新規インストール必要

```bash
# Inngest（週次・月次ジョブ管理）
pnpm add inngest

# テクニカル指標計算
pnpm add technicalindicators

# Excelファイルパース（JPX業種平均取得用）
pnpm add xlsx

# 通知機能（メール）
pnpm add resend

# 日付操作
pnpm add date-fns
```

---

## 🗄️ データベース設計

### マイグレーションSQL

```sql
-- 1. 銘柄マスター
CREATE TABLE stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker_code VARCHAR(10) NOT NULL UNIQUE,  -- 7203
  ticker_symbol VARCHAR(20) NOT NULL,       -- 7203.T
  name VARCHAR(200) NOT NULL,               -- トヨタ自動車
  sector_code VARCHAR(10),                  -- 業種コード
  sector_name VARCHAR(100),                 -- 輸送用機器
  market VARCHAR(50),                       -- プライム
  listing_date DATE,                        -- 上場日
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stocks_sector ON stocks(sector_code);
CREATE INDEX idx_stocks_market ON stocks(market);

-- 2. 業種平均PER/PBR（JPXから月次取得）
CREATE TABLE sector_averages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_code VARCHAR(10) NOT NULL,
  data_date DATE NOT NULL,                  -- データ基準日
  avg_per DECIMAL(10, 2),
  avg_pbr DECIMAL(10, 2),
  median_per DECIMAL(10, 2),
  median_pbr DECIMAL(10, 2),
  stock_count INT,                          -- 計算対象銘柄数
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(sector_code, data_date)
);

CREATE INDEX idx_sector_avg_date ON sector_averages(data_date DESC);

-- 3. スコア結果（高スコアのみ保存）
CREATE TABLE stock_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
  score_date DATE NOT NULL,
  score_type VARCHAR(10) NOT NULL,          -- 'mid_term' or 'long_term'

  -- スコア内訳
  per_score INT NOT NULL,
  pbr_score INT NOT NULL,
  rsi_score INT NOT NULL,
  price_range_score INT NOT NULL,
  sector_score INT NOT NULL,
  total_score DECIMAL(5, 4) NOT NULL,       -- 0.0000〜1.0000

  -- 参考データ（通知表示用）
  current_price DECIMAL(12, 2),
  per DECIMAL(10, 2),
  pbr DECIMAL(10, 2),
  rsi DECIMAL(5, 2),
  price_position DECIMAL(5, 4),             -- 価格位置（0〜1）

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(stock_id, score_date, score_type)
);

CREATE INDEX idx_scores_type_total ON stock_scores(score_type, total_score DESC, score_date DESC);
CREATE INDEX idx_scores_stock ON stock_scores(stock_id, score_date DESC);

-- 4. 通知履歴
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,                             -- 将来: ユーザー機能追加時
  notification_type VARCHAR(20) NOT NULL,   -- 'weekly', 'monthly'
  score_date DATE NOT NULL,
  stock_count INT NOT NULL,                 -- 通知した銘柄数
  sent_at TIMESTAMPTZ DEFAULT NOW(),

  -- 通知内容（JSON）
  stocks JSONB NOT NULL                     -- {ticker, name, score}[]
);

CREATE INDEX idx_notifications_date ON notifications(score_date DESC);

-- 5. ジョブ実行ログ
CREATE TABLE job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(100) NOT NULL,           -- 'weekly_scoring', 'update_sector_avg'
  status VARCHAR(20) NOT NULL,              -- 'running', 'success', 'failed'
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB,                           -- 処理件数など
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_logs_type ON job_logs(job_type, started_at DESC);
```

---

## ⚙️ Inngestジョブ設計

### ディレクトリ構成

```
inngest/
├── client.ts              # Inngest クライアント初期化
├── functions/
│   ├── update-sector-averages.ts    # 月次: 業種平均更新
│   ├── weekly-mid-term-scoring.ts   # 週次: 中期スコア計算
│   ├── monthly-long-term-scoring.ts # 月次: 長期スコア計算
│   └── update-stock-master.ts       # 四半期: 銘柄マスター更新
└── index.ts               # 全ジョブをエクスポート
```

### ジョブ実装例

```typescript
// inngest/functions/weekly-mid-term-scoring.ts
import { inngest } from "../client";
import { calculateMidTermScore } from "@/lib/scoring/calculator";

export const weeklyMidTermScoring = inngest.createFunction(
  { id: "weekly-mid-term-scoring", name: "週次中期スコア計算" },
  { cron: "0 0 * * 6" }, // 毎週土曜 0時
  async ({ event, step }) => {
    // 1. 全プライム銘柄取得
    const stocks = await step.run("fetch-stocks", async () => {
      return supabase.from("stocks").select("*").eq("market", "プライム");
    });

    // 2. 業種平均取得（事前に月次ジョブで更新済み）
    const sectorAverages = await step.run("fetch-sector-averages", async () => {
      return supabase.from("sector_averages").select("*").order("data_date", { ascending: false }).limit(1);
    });

    // 3. 各銘柄のスコア計算（並列処理）
    const scores = await step.run("calculate-scores", async () => {
      const results = await Promise.all(
        stocks.data.map(async (stock) => {
          return calculateMidTermScore(stock, sectorAverages.data);
        })
      );
      return results.filter((score) => score.total_score >= 0.6); // 高スコアのみ
    });

    // 4. DB保存
    await step.run("save-scores", async () => {
      return supabase.from("stock_scores").upsert(scores);
    });

    // 5. 通知送信（上位20社）
    await step.run("send-notifications", async () => {
      const topStocks = scores.sort((a, b) => b.total_score - a.total_score).slice(0, 20);
      // メール送信ロジック
    });

    return { processed: stocks.data.length, saved: scores.length };
  }
);
```

---

## 📝 実装タスク（優先順位順）

### Phase 1: 環境セットアップ（2-3日）

#### 1.1 Inngestセットアップ
- [ ] Inngestアカウント作成（https://www.inngest.com/）
- [ ] プロジェクトに `inngest` パッケージインストール
- [ ] `inngest/client.ts` 作成・初期化
- [ ] `/api/inngest` エンドポイント作成
- [ ] Inngest Dev Server起動確認
- [ ] 環境変数設定（`INNGEST_SIGNING_KEY`, `INNGEST_EVENT_KEY`）

#### 1.2 Supabaseマイグレーション
- [ ] マイグレーションSQL実行
- [ ] テーブル作成確認
- [ ] インデックス設定確認

#### 1.3 必要パッケージインストール
```bash
pnpm add inngest technicalindicators xlsx resend date-fns
```

---

### Phase 2: 銘柄マスターデータ準備（1-2日）

#### 2.1 JPXから銘柄一覧取得
- [ ] JPX公式サイトからプライム銘柄一覧CSVダウンロード
  - URL: https://www.jpx.co.jp/markets/statistics-equities/misc/01.html
- [ ] CSV → JSON変換スクリプト作成
- [ ] 業種コードマッピングテーブル作成（東証33業種）

#### 2.2 Supabaseへデータ投入
- [ ] `stocks` テーブルへ一括INSERT
- [ ] データ件数確認（約1,800銘柄）
- [ ] 銘柄コード重複チェック

---

### Phase 3: データ取得・計算ライブラリ（3-4日）

#### 3.1 Yahoo Finance クライアント拡張
- [ ] `src/lib/yahoo-finance/fundamentals.ts` 作成
  - PER/PBR取得関数
- [ ] `src/lib/yahoo-finance/historical.ts` 作成
  - 週足・月足データ取得関数
- [ ] エラーハンドリング・リトライロジック実装

#### 3.2 JPX業種平均取得ライブラリ
- [ ] `src/lib/jpx/sector-averages.ts` 作成
  - ExcelダウンロードURL生成関数
  - `xlsx` ライブラリでパース
  - データ抽出ロジック

#### 3.3 テクニカル指標計算ライブラリ
- [ ] `src/lib/scoring/technical.ts` 作成
  - RSI計算（`technicalindicators`使用）
  - 移動平均計算
  - 高値安値判定

---

### Phase 4: スコアリングエンジン（3-4日）

#### 4.1 スコア計算ロジック実装
- [ ] `src/lib/scoring/calculator.ts` 作成
  - `calculatePERScore()`
  - `calculatePBRScore()`
  - `calculateRSIScore()`
  - `calculatePriceRangeScore()`
  - `calculateSectorScore()`
  - `calculateMidTermScore()` - 統合関数
  - `calculateLongTermScore()` - 統合関数

#### 4.2 Zodスキーマ定義
- [ ] `src/lib/scoring/schemas.ts` 作成
  - 入力データバリデーション
  - スコア結果スキーマ

---

### Phase 5: Inngestジョブ実装（4-5日）

#### 5.1 業種平均更新ジョブ
- [ ] `inngest/functions/update-sector-averages.ts` 実装
- [ ] JPXからExcelダウンロード
- [ ] パース→Supabase保存
- [ ] テスト実行

#### 5.2 週次中期スコア計算ジョブ
- [ ] `inngest/functions/weekly-mid-term-scoring.ts` 実装
- [ ] 全銘柄取得
- [ ] Yahoo Finance APIから週足データ取得
- [ ] スコア計算
- [ ] DB保存（スコア0.6以上のみ）
- [ ] テスト実行

#### 5.3 月次長期スコア計算ジョブ
- [ ] `inngest/functions/monthly-long-term-scoring.ts` 実装
- [ ] 週次ジョブと同様だが月足データ使用
- [ ] テスト実行

#### 5.4 銘柄マスター更新ジョブ
- [ ] `inngest/functions/update-stock-master.ts` 実装
- [ ] 四半期ごとに実行
- [ ] 新規上場・廃止銘柄の反映

---

### Phase 6: 通知機能（2-3日）

#### 6.1 メール通知実装
- [ ] Resendアカウント作成・API Key取得
- [ ] メールテンプレート作成（HTML）
- [ ] `src/lib/notifications/email.ts` 実装
  - 上位20社抽出ロジック
  - メール本文生成
  - Resend API呼び出し

#### 6.2 通知履歴保存
- [ ] `notifications` テーブルへ保存ロジック
- [ ] 通知成功/失敗のログ記録

---

### Phase 7: tRPC API実装（2-3日）

#### 7.1 スコア取得API
- [ ] `trpc/routers/stocks.ts` 作成
  - `getTopScores` - 上位N件取得
  - `getStockScore` - 個別銘柄スコア取得
  - `getScoreHistory` - スコア履歴取得

#### 7.2 銘柄検索API
- [ ] `searchStocks` - 銘柄名・コード検索
- [ ] ページネーション実装

---

### Phase 8: UI実装（3-4日）

#### 8.1 スコアランキング画面
- [ ] `/app/(dashboard)/scores/page.tsx` 作成
- [ ] テーブル表示（銘柄名、コード、スコア、価格）
- [ ] ソート機能
- [ ] フィルター機能（業種、スコア範囲）

#### 8.2 個別銘柄詳細画面
- [ ] `/app/(dashboard)/stocks/[ticker]/page.tsx` 作成
- [ ] スコア詳細表示（各要素の内訳）
- [ ] 参考データ表示（PER、PBR、RSI）
- [ ] チャート表示（価格推移）

#### 8.3 ダッシュボード統合
- [ ] マーケットサマリーと並べて表示
- [ ] 「今週の注目銘柄」セクション追加

---

### Phase 9: テスト・デバッグ（2-3日）

#### 9.1 ユニットテスト
- [ ] スコア計算ロジックのテスト
- [ ] データ取得関数のテスト（モック使用）

#### 9.2 統合テスト
- [ ] Inngestジョブの手動実行
- [ ] データフロー全体の確認

#### 9.3 データ整合性チェック
- [ ] スコア値の妥当性確認
- [ ] 業種平均データの正確性確認

---

### Phase 10: デプロイ・運用（1-2日）

#### 10.1 Vercelデプロイ
- [ ] 環境変数設定（本番環境）
- [ ] Inngest Webhook URL設定

#### 10.2 Inngest Cloud設定
- [ ] 本番環境ジョブ登録
- [ ] スケジュール確認（週次土曜0時、月次1日0時）

#### 10.3 モニタリング設定
- [ ] Inngest ダッシュボードでジョブ実行監視
- [ ] エラーアラート設定（Slack/Email）

---

## ⏱️ 総見積もり時間

| Phase | 内容 | 見積もり日数 |
|-------|------|--------------|
| Phase 1 | 環境セットアップ | 2-3日 |
| Phase 2 | 銘柄マスターデータ準備 | 1-2日 |
| Phase 3 | データ取得・計算ライブラリ | 3-4日 |
| Phase 4 | スコアリングエンジン | 3-4日 |
| Phase 5 | Inngestジョブ実装 | 4-5日 |
| Phase 6 | 通知機能 | 2-3日 |
| Phase 7 | tRPC API実装 | 2-3日 |
| Phase 8 | UI実装 | 3-4日 |
| Phase 9 | テスト・デバッグ | 2-3日 |
| Phase 10 | デプロイ・運用 | 1-2日 |
| **合計** | | **23-33日** |

---

## 🔗 参考リンク

- [Inngest Documentation](https://www.inngest.com/docs)
- [Inngest Next.js Quick Start](https://www.inngest.com/docs/getting-started/nextjs-quick-start)
- [yahoo-finance2 Documentation](https://github.com/gadicc/yahoo-finance2)
- [technicalindicators Documentation](https://www.npmjs.com/package/technicalindicators)
- [JPX統計データ](https://www.jpx.co.jp/markets/statistics-equities/misc/index.html)
- [Resend Documentation](https://resend.com/docs)

---

## 📌 次のアクション

1. **Phase 1開始**: Inngestセットアップ
2. **Phase 2開始**: 銘柄マスターデータ準備
3. **データソース確認**: JPXから最新の業種平均Excelダウンロード・確認
