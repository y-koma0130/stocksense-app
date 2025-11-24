# 割安株分析機能のリファクタリング計画

## 現状の課題

現在の実装では、ジョブ実行時にスコア計算を行い、スコア値のみをDBに保存しています。

### 問題点
- 生の指標値（PER、PBR、RSIなど）がDBに保存されていない
- スコアリングロジック変更時に全データの再計算が必要
- ユーザーが実際の指標値を確認できない
- データの透明性と柔軟性が低い

## 改善方針

**ジョブでは生データの収集と保存のみを行い、評価計算は表示時に動的に実行する**

---

## Phase 1: データモデルの変更

### 1.1 スキーマ設計

```sql
-- 新テーブル: stock_indicators
CREATE TABLE stock_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  collected_at DATE NOT NULL,
  period_type period_type_enum NOT NULL,

  -- 財務指標
  current_price DECIMAL(10, 2),
  per DECIMAL(10, 2),
  pbr DECIMAL(10, 2),

  -- テクニカル指標
  rsi DECIMAL(5, 2),

  -- 価格レンジ指標
  week_52_high DECIMAL(10, 2),
  week_52_low DECIMAL(10, 2),

  -- 業種平均（参照データ）
  sector_code VARCHAR(10),
  sector_avg_per DECIMAL(10, 2),
  sector_avg_pbr DECIMAL(10, 2),

  created_at TIMESTAMP DEFAULT NOW() NOT NULL,

  UNIQUE(stock_id, collected_at, period_type)
);

CREATE TYPE period_type_enum AS ENUM ('weekly', 'monthly');

CREATE INDEX idx_indicators_period_collected ON stock_indicators(period_type, collected_at);
CREATE INDEX idx_indicators_stock ON stock_indicators(stock_id);
```

**命名の根拠:**
- `stock_indicators`: 生の指標データを保存することを明示
- `collected_at`: データ収集日時を明確に表現
- `period_type`: データ収集周期（weekly/monthly）
- `week_52_high/low`: 一般的な金融用語に準拠

### 1.2 Drizzleスキーマ定義

```typescript
// src/db/schema.ts

export const periodTypeEnum = pgEnum('period_type', ['weekly', 'monthly']);

export const stockIndicators = pgTable(
  'stock_indicators',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    stockId: uuid('stock_id')
      .notNull()
      .references(() => stocks.id, { onDelete: 'cascade' }),
    collectedAt: date('collected_at').notNull(),
    periodType: periodTypeEnum('period_type').notNull(),

    // 財務指標
    currentPrice: decimal('current_price', { precision: 10, scale: 2 }),
    per: decimal('per', { precision: 10, scale: 2 }),
    pbr: decimal('pbr', { precision: 10, scale: 2 }),

    // テクニカル指標
    rsi: decimal('rsi', { precision: 5, scale: 2 }),

    // 価格レンジ指標
    week52High: decimal('week_52_high', { precision: 10, scale: 2 }),
    week52Low: decimal('week_52_low', { precision: 10, scale: 2 }),

    // 業種平均
    sectorCode: varchar('sector_code', { length: 10 }),
    sectorAvgPer: decimal('sector_avg_per', { precision: 10, scale: 2 }),
    sectorAvgPbr: decimal('sector_avg_pbr', { precision: 10, scale: 2 }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    periodCollectedIdx: index('idx_indicators_period_collected').on(
      table.periodType,
      table.collectedAt,
    ),
    stockIdx: index('idx_indicators_stock').on(table.stockId),
    uniqStockCollectedPeriod: unique('uniq_stock_collected_period').on(
      table.stockId,
      table.collectedAt,
      table.periodType,
    ),
  }),
);
```

---

## Phase 2: ドメイン層の設計（軽量DDD）

### 2.1 値オブジェクト

```typescript
// src/server/features/valueStockAnalysis/domain/values/periodType.ts

import { z } from 'zod';

export const periodTypeSchema = z.enum(['weekly', 'monthly']);
export type PeriodType = z.infer<typeof periodTypeSchema>;
```

```typescript
// src/server/features/valueStockAnalysis/domain/values/priceRange.ts

import { z } from 'zod';

export const priceRangeSchema = z.object({
  high: z.number().positive(),
  low: z.number().positive(),
  current: z.number().positive(),
}).refine(
  (data) => data.low <= data.current && data.current <= data.high,
  { message: 'Current price must be between low and high' },
);

export type PriceRange = z.infer<typeof priceRangeSchema>;
```

### 2.2 エンティティ（集約ルート）

```typescript
// src/server/features/valueStockAnalysis/domain/entities/stockIndicator.ts

import { z } from 'zod';
import { periodTypeSchema } from '../values/periodType';

export const stockIndicatorSchema = z.object({
  stockId: z.string().uuid(),
  collectedAt: z.string(), // ISO date string
  periodType: periodTypeSchema,

  // 財務指標
  currentPrice: z.number().positive().nullable(),
  per: z.number().positive().nullable(),
  pbr: z.number().positive().nullable(),

  // テクニカル指標
  rsi: z.number().min(0).max(100).nullable(),

  // 価格レンジ
  week52High: z.number().positive().nullable(),
  week52Low: z.number().positive().nullable(),

  // 業種平均
  sectorCode: z.string().nullable(),
  sectorAvgPer: z.number().positive().nullable(),
  sectorAvgPbr: z.number().positive().nullable(),
});

export type StockIndicator = z.infer<typeof stockIndicatorSchema>;

// ファクトリ関数
export type CreateStockIndicator = (input: unknown) => StockIndicator;

export const createStockIndicator: CreateStockIndicator = (input) => {
  return stockIndicatorSchema.parse(input);
};
```

### 2.3 DTO

```typescript
// src/server/features/valueStockAnalysis/application/dto/stockIndicator.dto.ts

import { z } from 'zod';

export const stockIndicatorDtoSchema = z.object({
  stockId: z.string(),
  tickerCode: z.string(),
  tickerSymbol: z.string(),
  name: z.string(),
  sectorCode: z.string().nullable(),
  sectorName: z.string().nullable(),

  // 指標値
  currentPrice: z.number().nullable(),
  per: z.number().nullable(),
  pbr: z.number().nullable(),
  rsi: z.number().nullable(),
  week52High: z.number().nullable(),
  week52Low: z.number().nullable(),
  sectorAvgPer: z.number().nullable(),
  sectorAvgPbr: z.number().nullable(),

  collectedAt: z.string(),
  periodType: z.enum(['weekly', 'monthly']),
});

export type StockIndicatorDto = z.infer<typeof stockIndicatorDtoSchema>;
```

---

## Phase 3: インフラ層の実装

### 3.1 リポジトリ

```typescript
// src/server/features/valueStockAnalysis/infrastructure/repositories/saveStockIndicator.repository.ts

import { db } from '@/db';
import { stockIndicators } from '@/db/schema';
import type { StockIndicator } from '../../domain/entities/stockIndicator';

export type SaveStockIndicator = (indicator: StockIndicator) => Promise<void>;

export const saveStockIndicator: SaveStockIndicator = async (indicator) => {
  await db.insert(stockIndicators).values({
    stockId: indicator.stockId,
    collectedAt: indicator.collectedAt,
    periodType: indicator.periodType,
    currentPrice: indicator.currentPrice?.toString() ?? null,
    per: indicator.per?.toString() ?? null,
    pbr: indicator.pbr?.toString() ?? null,
    rsi: indicator.rsi?.toString() ?? null,
    week52High: indicator.week52High?.toString() ?? null,
    week52Low: indicator.week52Low?.toString() ?? null,
    sectorCode: indicator.sectorCode,
    sectorAvgPer: indicator.sectorAvgPer?.toString() ?? null,
    sectorAvgPbr: indicator.sectorAvgPbr?.toString() ?? null,
  }).onConflictDoNothing();
};
```

### 3.2 クエリサービス

```typescript
// src/server/features/valueStockAnalysis/infrastructure/queryServices/getStockIndicators.ts

import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { stockIndicators, stocks } from '@/db/schema';
import type { StockIndicatorDto } from '../../application/dto/stockIndicator.dto';
import type { PeriodType } from '../../domain/values/periodType';

export type GetStockIndicators = (params: {
  limit: number;
  periodType?: PeriodType;
}) => Promise<readonly StockIndicatorDto[]>;

export const getStockIndicators: GetStockIndicators = async ({ limit, periodType }) => {
  // 最新の収集日を取得
  const latestRecord = await db
    .select({ collectedAt: stockIndicators.collectedAt })
    .from(stockIndicators)
    .where(periodType ? eq(stockIndicators.periodType, periodType) : undefined)
    .orderBy(desc(stockIndicators.collectedAt))
    .limit(1);

  if (!latestRecord[0]) {
    return [];
  }

  const latestDate = latestRecord[0].collectedAt;

  // 生データを取得（多めに取得してフロントでフィルタ・ソート）
  let query = db
    .select({
      stockId: stockIndicators.stockId,
      tickerCode: stocks.tickerCode,
      tickerSymbol: stocks.tickerSymbol,
      name: stocks.name,
      sectorCode: stocks.sectorCode,
      sectorName: stocks.sectorName,
      currentPrice: stockIndicators.currentPrice,
      per: stockIndicators.per,
      pbr: stockIndicators.pbr,
      rsi: stockIndicators.rsi,
      week52High: stockIndicators.week52High,
      week52Low: stockIndicators.week52Low,
      sectorAvgPer: stockIndicators.sectorAvgPer,
      sectorAvgPbr: stockIndicators.sectorAvgPbr,
      collectedAt: stockIndicators.collectedAt,
      periodType: stockIndicators.periodType,
    })
    .from(stockIndicators)
    .innerJoin(stocks, eq(stockIndicators.stockId, stocks.id))
    .where(eq(stockIndicators.collectedAt, latestDate))
    .$dynamic();

  if (periodType) {
    query = query.where(eq(stockIndicators.periodType, periodType));
  }

  const results = await query.limit(limit * 3);

  // Decimal型をnumberに変換
  return results.map((row) => ({
    ...row,
    currentPrice: row.currentPrice ? Number(row.currentPrice) : null,
    per: row.per ? Number(row.per) : null,
    pbr: row.pbr ? Number(row.pbr) : null,
    rsi: row.rsi ? Number(row.rsi) : null,
    week52High: row.week52High ? Number(row.week52High) : null,
    week52Low: row.week52Low ? Number(row.week52Low) : null,
    sectorAvgPer: row.sectorAvgPer ? Number(row.sectorAvgPer) : null,
    sectorAvgPbr: row.sectorAvgPbr ? Number(row.sectorAvgPbr) : null,
  }));
};
```

---

## Phase 4: ジョブの簡素化

### 4.1 ジョブ命名

```
weeklyStockScoring.ts → weeklyIndicatorCollection.ts
monthlyStockScoring.ts → monthlyIndicatorCollection.ts
```

### 4.2 ジョブ実装例

```typescript
// src/server/jobs/weeklyIndicatorCollection.ts

import { isNull } from 'drizzle-orm';
import { inngest } from '../../../inngest/client';
import { db } from '../../db';
import { stocks } from '../../db/schema';
import { getLatestSectorAverages } from '../features/marketData/infrastructure/queryServices/getLatestSectorAverages.queryService';
import { createStockIndicator } from '../features/valueStockAnalysis/domain/entities/stockIndicator';
import { calculateRSI } from '../features/valueStockAnalysis/domain/services/calculateRSI';
import { getDailyData } from '../features/valueStockAnalysis/infrastructure/externalServices/yahooFinance/getDailyData';
import { getFundamentals } from '../features/valueStockAnalysis/infrastructure/externalServices/yahooFinance/getFundamentals';
import { saveStockIndicator } from '../features/valueStockAnalysis/infrastructure/repositories/saveStockIndicator.repository';

export const weeklyIndicatorCollection = inngest.createFunction(
  {
    id: 'weekly-indicator-collection',
    name: 'Weekly Indicator Collection',
    retries: 3,
  },
  { cron: 'TZ=Asia/Tokyo 0 0 * * 6' },
  async ({ step }) => {
    const activeStocks = await step.run('fetch-active-stocks', async () => {
      return await db.select().from(stocks).where(isNull(stocks.deletedAt));
    });

    const sectorAveragesData = await step.run('fetch-sector-averages', async () => {
      const data = await getLatestSectorAverages();
      return Array.from(data.entries());
    });

    const sectorAverages = new Map(sectorAveragesData);

    const batchSize = 50;
    let totalSaved = 0;

    for (let i = 0; i < activeStocks.length; i += batchSize) {
      const batch = activeStocks.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      const batchResult = await step.run(`process-batch-${batchNumber}`, async () => {
        let savedCount = 0;
        const collectedAt = new Date().toISOString().split('T')[0];

        for (const stock of batch) {
          try {
            // 外部APIからデータ取得
            const fundamentals = await getFundamentals(stock.tickerSymbol);

            if (!fundamentals.currentPrice) {
              console.log(`Skipping ${stock.tickerSymbol}: No price data`);
              continue;
            }

            const dailyData = await getDailyData(stock.tickerSymbol, 30);
            const rsi = calculateRSI(dailyData, 14);

            const sectorAvg = stock.sectorCode ? sectorAverages.get(stock.sectorCode) : undefined;

            // エンティティ生成（バリデーション付き）
            const indicator = createStockIndicator({
              stockId: stock.id,
              collectedAt,
              periodType: 'weekly',
              currentPrice: fundamentals.currentPrice,
              per: fundamentals.per,
              pbr: fundamentals.pbr,
              rsi,
              week52High: fundamentals.fiftyTwoWeekHigh || fundamentals.currentPrice,
              week52Low: fundamentals.fiftyTwoWeekLow || fundamentals.currentPrice,
              sectorCode: stock.sectorCode,
              sectorAvgPer: sectorAvg?.avgPer ?? null,
              sectorAvgPbr: sectorAvg?.avgPbr ?? null,
            });

            // リポジトリで永続化
            await saveStockIndicator(indicator);
            savedCount++;
          } catch (error) {
            console.error(`Error processing ${stock.tickerSymbol}:`, error);
          }

          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        return { savedCount };
      });

      totalSaved += batchResult.savedCount;
    }

    return {
      message: 'Weekly indicator collection completed',
      processedStocks: activeStocks.length,
      savedIndicators: totalSaved,
    };
  },
);
```

---

## Phase 5: フロントエンドの実装

### 5.1 評価計算ユーティリティ

```typescript
// src/features/dashboard/utils/calculateValueScore.ts

export type IndicatorValues = Readonly<{
  per: number | null;
  pbr: number | null;
  rsi: number | null;
  currentPrice: number;
  week52High: number;
  week52Low: number;
  sectorAvgPer: number | null;
  sectorAvgPbr: number | null;
}>;

export type ValueScore = Readonly<{
  perScore: number;
  pbrScore: number;
  rsiScore: number;
  pricePositionScore: number;
  sectorRelativeScore: number;
  totalScore: number;
}>;

export type CalculateValueScore = (values: IndicatorValues) => ValueScore;

export const calculateValueScore: CalculateValueScore = (values) => {
  const perScore = calculatePerScore(values.per);
  const pbrScore = calculatePbrScore(values.pbr);
  const rsiScore = calculateRsiScore(values.rsi);
  const pricePositionScore = calculatePricePositionScore(
    values.currentPrice,
    values.week52High,
    values.week52Low,
  );
  const sectorRelativeScore = calculateSectorRelativeScore(
    values.per,
    values.pbr,
    values.sectorAvgPer,
    values.sectorAvgPbr,
  );

  const totalScore =
    (perScore * 0.25 +
     pbrScore * 0.25 +
     rsiScore * 0.2 +
     pricePositionScore * 0.15 +
     sectorRelativeScore * 0.15) / 100;

  return {
    perScore,
    pbrScore,
    rsiScore,
    pricePositionScore,
    sectorRelativeScore,
    totalScore,
  };
};

type CalculatePerScore = (per: number | null) => number;
const calculatePerScore: CalculatePerScore = (per) => {
  if (per === null || per <= 0) return 0;
  if (per <= 10) return 100;
  if (per <= 15) return 75;
  if (per <= 20) return 50;
  if (per <= 25) return 25;
  return 0;
};

// ... 他のスコア計算関数も同様に型定義
```

### 5.2 フック

```typescript
// src/features/dashboard/hooks/useValueStockAnalysis.ts

import { useMemo } from 'react';
import { trpc } from '../../../../trpc/client';
import { calculateValueScore } from '../utils/calculateValueScore';
import type { ValueScore } from '../utils/calculateValueScore';
import type { StockIndicatorDto } from '@/server/features/valueStockAnalysis/application/dto/stockIndicator.dto';

const SCORE_THRESHOLD = 0.6;

type StockWithScore = StockIndicatorDto & Readonly<{ scores: ValueScore }>;

export type UseValueStockAnalysis = (params: {
  limit?: number;
  periodType?: 'weekly' | 'monthly';
}) => Readonly<{
  data: readonly StockWithScore[];
  loading: boolean;
  error: string | null;
}>;

export const useValueStockAnalysis: UseValueStockAnalysis = (params) => {
  const { data, isLoading, error } = trpc.valueStockAnalysis.getIndicators.useQuery(
    {
      limit: (params.limit ?? 20) * 3,
      periodType: params.periodType,
    },
    {
      refetchInterval: 60 * 60 * 1000,
      staleTime: 30 * 60 * 1000,
    },
  );

  const scoredData = useMemo(() => {
    if (!data) return [];

    return data
      .map((indicator) => ({
        ...indicator,
        scores: calculateValueScore(indicator),
      }))
      .filter((item) => item.scores.totalScore >= SCORE_THRESHOLD)
      .sort((a, b) => b.scores.totalScore - a.scores.totalScore)
      .slice(0, params.limit ?? 20);
  }, [data, params.limit]);

  return {
    data: scoredData,
    loading: isLoading,
    error: error?.message ?? null,
  };
};
```

---

## Phase 6: 段階的移行手順

### Step 1: スキーマとインフラ準備
- [ ] マイグレーションファイル作成（`stock_indicators`テーブル）
- [ ] `period_type_enum`作成
- [ ] Drizzleスキーマ更新
- [ ] マイグレーション実行

### Step 2: ドメイン層実装
- [ ] 値オブジェクト作成（`periodType`, `priceRange`など）
- [ ] エンティティ作成（`stockIndicator.ts`）
- [ ] DTO作成（`stockIndicator.dto.ts`）

### Step 3: インフラ層実装
- [ ] リポジトリ作成（`saveStockIndicator.repository.ts`）
- [ ] クエリサービス作成（`getStockIndicators.ts`）
- [ ] tRPCルーター作成

### Step 4: ジョブ実装
- [ ] `weeklyIndicatorCollection.ts`作成
- [ ] `monthlyIndicatorCollection.ts`作成
- [ ] Inngestに登録・テスト実行

### Step 5: フロントエンド実装
- [ ] 評価計算ユーティリティ作成
- [ ] フック作成（`useValueStockAnalysis.ts`）
- [ ] テーブルコンポーネント更新
- [ ] 動作確認

### Step 6: 旧システム削除
- [ ] 旧ジョブ削除
- [ ] 旧ドメイン層削除
- [ ] 旧テーブル削除

---

## ディレクトリ構造

```
src/
├── server/
│   ├── features/
│   │   └── valueStockAnalysis/
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   │   └── stockIndicator.ts
│   │       │   ├── values/
│   │       │   │   ├── periodType.ts
│   │       │   │   └── priceRange.ts
│   │       │   └── services/
│   │       │       └── calculateRSI.ts
│   │       ├── application/
│   │       │   └── dto/
│   │       │       └── stockIndicator.dto.ts
│   │       ├── infrastructure/
│   │       │   ├── repositories/
│   │       │   │   └── saveStockIndicator.repository.ts
│   │       │   ├── queryServices/
│   │       │   │   └── getStockIndicators.ts
│   │       │   └── externalServices/
│   │       │       └── yahooFinance/ (既存)
│   │       └── presentation/
│   │           └── router.ts
│   └── jobs/
│       ├── weeklyIndicatorCollection.ts
│       └── monthlyIndicatorCollection.ts
└── features/
    └── dashboard/
        ├── utils/
        │   └── calculateValueScore.ts
        ├── hooks/
        │   └── useValueStockAnalysis.ts
        └── components/
            ├── ValueStockTable.tsx
            └── PeriodTypeToggle.tsx
```

---

## メリット

- **柔軟性**: 評価ロジック変更時にジョブ再実行不要
- **透明性**: 実際の指標値を表示可能
- **保守性**: データとロジックの分離
- **拡張性**: 新しい評価軸の追加が容易
- **パフォーマンス**: ジョブ処理の軽量化
- **型安全性**: any禁止、適切な型関数定義
- **アーキテクチャ**: 軽量DDDを保持
