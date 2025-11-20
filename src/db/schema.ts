import {
  date,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * スコアタイプのEnum定義
 */
export const scoreTypeEnum = pgEnum("score_type", ["mid_term", "long_term"]);

/**
 * 1. 銘柄マスター
 * 東証全市場（最大約4,000銘柄）の基本情報
 */
export const stocks = pgTable(
  "stocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tickerCode: varchar("ticker_code", { length: 10 }).notNull().unique(), // 7203
    tickerSymbol: varchar("ticker_symbol", { length: 20 }).notNull(), // 7203.T
    name: varchar("name", { length: 200 }).notNull(), // トヨタ自動車
    sectorCode: varchar("sector_code", { length: 10 }), // 業種コード
    sectorName: varchar("sector_name", { length: 100 }), // 輸送用機器
    market: varchar("market", { length: 50 }), // プライム, スタンダード, グロース
    listingDate: date("listing_date"), // 上場日
    deletedAt: timestamp("deleted_at"), // 廃止日（NULLなら上場中）
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    sectorIdx: index("idx_stocks_sector").on(table.sectorCode),
    marketIdx: index("idx_stocks_market").on(table.market),
    tickerSymbolIdx: index("idx_stocks_ticker_symbol").on(table.tickerSymbol),
    deletedIdx: index("idx_stocks_deleted").on(table.deletedAt),
  }),
);

/**
 * 2. 業種平均PER/PBR
 * JPX公式Excelから月次で取得・更新
 */
export const sectorAverages = pgTable(
  "sector_averages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sectorCode: varchar("sector_code", { length: 10 }).notNull(),
    dataDate: date("data_date").notNull(), // データ基準日
    avgPer: decimal("avg_per", { precision: 10, scale: 2 }),
    avgPbr: decimal("avg_pbr", { precision: 10, scale: 2 }),
    medianPer: decimal("median_per", { precision: 10, scale: 2 }),
    medianPbr: decimal("median_pbr", { precision: 10, scale: 2 }),
    stockCount: integer("stock_count"), // 計算対象銘柄数
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    dataDateIdx: index("idx_sector_avg_date").on(table.dataDate),
    sectorCodeIdx: index("idx_sector_avg_code").on(table.sectorCode, table.dataDate),
    // UNIQUE constraint
    uniqSectorDate: unique("uniq_sector_date").on(table.sectorCode, table.dataDate),
  }),
);

/**
 * 3. スコア結果
 * 高スコア（0.6以上）の銘柄のみ保存
 */
export const stockScores = pgTable(
  "stock_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    scoreDate: date("score_date").notNull(),
    scoreType: scoreTypeEnum("score_type").notNull(), // 'mid_term' or 'long_term'

    // スコア内訳
    perScore: integer("per_score").notNull(),
    pbrScore: integer("pbr_score").notNull(),
    rsiScore: integer("rsi_score").notNull(),
    priceRangeScore: integer("price_range_score").notNull(),
    sectorScore: decimal("sector_score", { precision: 5, scale: 2 }).notNull(), // 0.00〜100.00
    totalScore: decimal("total_score", { precision: 5, scale: 4 }).notNull(), // 0.0000〜1.0000

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    typeTotalIdx: index("idx_scores_type_total").on(
      table.scoreType,
      table.totalScore,
      table.scoreDate,
    ),
    stockIdx: index("idx_scores_stock").on(table.stockId, table.scoreDate),
    dateIdx: index("idx_scores_date").on(table.scoreDate, table.totalScore),
    // UNIQUE constraint
    uniqStockDateType: unique("uniq_stock_date_type").on(
      table.stockId,
      table.scoreDate,
      table.scoreType,
    ),
  }),
);

// Type exports
export type Stock = typeof stocks.$inferSelect;
export type NewStock = typeof stocks.$inferInsert;

export type SectorAverage = typeof sectorAverages.$inferSelect;
export type NewSectorAverage = typeof sectorAverages.$inferInsert;

export type StockScore = typeof stockScores.$inferSelect;
export type NewStockScore = typeof stockScores.$inferInsert;
