# StockSense

AI-powered investment analysis platform that helps individual investors discover undervalued Japanese stocks through automated scoring and market analysis.

## Overview

StockSense provides mid-to-long-term investment signals for Japanese stocks by analyzing fundamental data (PER, PBR, dividend yield), technical indicators, and market conditions. The platform automatically scores stocks and notifies users via LINE when attractive buying opportunities arise.

### Key Features

- **Automated Stock Scoring**: Weekly/monthly analysis of 3,900+ Japanese stocks
- **Value Stock Detection**: Identifies undervalued stocks using fundamental analysis
- **Stock Tagging**: AI-powered classification by macro sensitivity and business themes
- **LINE Notifications**: Alerts for high-potential investment opportunities
- **Market Dashboard**: Visual presentation of scored stocks with AI-generated insights

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16, React 19 |
| Language | TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Drizzle ORM |
| API | tRPC |
| State Management | Jotai, TanStack Query |
| Styling | Panda CSS |
| Job Scheduler | Inngest |
| Data Sources | Yahoo Finance API |
| AI | OpenAI GPT-4o-mini |
| Testing | Vitest |
| Linting | Biome |

---

## セットアップ

### 前提条件

- Node.js 20以上
- pnpm
- Supabase アカウント

### 環境変数の設定

`.env.local` ファイルを作成:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=your-database-url

# Inngest
INNGEST_SIGNING_KEY=your-signing-key
INNGEST_EVENT_KEY=your-event-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key
```

### インストール

```bash
pnpm install
```

---

## 開発

### 開発サーバー起動

```bash
# Next.js開発サーバー
pnpm dev

# Inngest開発サーバー（別ターミナル）
pnpm inngest
```

### コード品質

```bash
# Lintチェック
pnpm lint

# Lint修正
pnpm lint:fix

# フォーマット
pnpm format

# 型チェック
pnpm tsc --noEmit
```

### テスト

```bash
# テスト実行
pnpm test

# UIモードでテスト
pnpm test:ui

# カバレッジ付きテスト
pnpm test:coverage
```

---

## データベース

### マイグレーション

```bash
# スキーマファイル生成
pnpm db:generate

# マイグレーション実行
pnpm db:migrate

# スキーマを直接プッシュ（開発用）
pnpm db:push

# Drizzle Studio起動
pnpm db:studio
```

### 銘柄マスターデータのインポート

1. JPX公式サイトから銘柄一覧をダウンロード
   https://www.jpx.co.jp/markets/statistics-equities/misc/01.html

2. `data/` ディレクトリに配置

3. インポート実行

```bash
pnpm import:stocks ./data/data_j.xls
```

---

## スクリプト

### 銘柄タグ分類

LLMを使用して銘柄にマクロタグ・テーマタグを付与します。

```bash
# dry-runモード（DBに保存しない）
pnpm tsx scripts/classify-stock-tags.ts --dry-run --limit 10

# 全件実行
pnpm tsx scripts/classify-stock-tags.ts
```

---

## デプロイ

### Vercel

```bash
# 本番ビルド
pnpm vercel-build
```

環境変数をVercelのダッシュボードで設定してください。

---

## ジョブスケジュール

| ジョブ | スケジュール | 説明 |
|--------|--------------|------|
| 週次スコアリング | 毎週土曜日 0:00 (JST) | 短中期向けスコア計算 |
| 月次スコアリング | 毎月1日 0:00 (JST) | 中長期向けスコア計算 |

スコア0.6以上の銘柄が自動的にデータベースに保存されます。
