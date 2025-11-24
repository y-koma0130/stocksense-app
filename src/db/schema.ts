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
 * 期間タイプのEnum定義
 */
export const periodTypeEnum = pgEnum("period_type", ["weekly", "monthly"]);

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
 * 3. 銘柄指標データ
 * 全銘柄の生の指標値を保存（スコア計算なし）
 */
export const stockIndicators = pgTable(
  "stock_indicators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    collectedAt: date("collected_at").notNull(),
    periodType: periodTypeEnum("period_type").notNull(), // 'weekly' or 'monthly'

    // 財務指標
    currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
    per: decimal("per", { precision: 10, scale: 2 }),
    pbr: decimal("pbr", { precision: 10, scale: 2 }),

    // テクニカル指標
    rsi: decimal("rsi", { precision: 5, scale: 2 }),

    // 価格レンジ指標
    week52High: decimal("week_52_high", { precision: 10, scale: 2 }),
    week52Low: decimal("week_52_low", { precision: 10, scale: 2 }),

    // 業種平均（参照データ）
    sectorCode: varchar("sector_code", { length: 10 }),
    sectorAvgPer: decimal("sector_avg_per", { precision: 10, scale: 2 }),
    sectorAvgPbr: decimal("sector_avg_pbr", { precision: 10, scale: 2 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    periodCollectedIdx: index("idx_indicators_period_collected").on(
      table.periodType,
      table.collectedAt,
    ),
    stockIdx: index("idx_indicators_stock").on(table.stockId),
    uniqStockCollectedPeriod: unique("uniq_stock_collected_period").on(
      table.stockId,
      table.collectedAt,
      table.periodType,
    ),
  }),
);

/**
 * 4. 銘柄財務健全性データ
 * 月次で更新される財務健全性指標（罠銘柄除外用）
 * 銘柄ごとに1レコード（最新のみ保持）
 */
export const stockFinancialHealth = pgTable(
  "stock_financial_health",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" })
      .unique(),
    equityRatio: decimal("equity_ratio", { precision: 5, scale: 2 }), // 自己資本比率(%)
    roe: decimal("roe", { precision: 6, scale: 2 }), // ROE(%)
    operatingIncomeDeclineYears: integer("operating_income_decline_years"), // 営業利益減少連続年数
    operatingCashFlowNegativeYears: integer("operating_cash_flow_negative_years"), // 営業CF負の連続年数
    revenueDeclineYears: integer("revenue_decline_years"), // 売上減少連続年数
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    stockIdx: index("idx_financial_health_stock").on(table.stockId),
  }),
);

// Type exports
export type Stock = typeof stocks.$inferSelect;
export type NewStock = typeof stocks.$inferInsert;

export type SectorAverage = typeof sectorAverages.$inferSelect;
export type NewSectorAverage = typeof sectorAverages.$inferInsert;

export type StockIndicator = typeof stockIndicators.$inferSelect;
export type NewStockIndicator = typeof stockIndicators.$inferInsert;

export type StockFinancialHealth = typeof stockFinancialHealth.$inferSelect;
export type NewStockFinancialHealth = typeof stockFinancialHealth.$inferInsert;

/**
 * 5. LINE連携ユーザー
 * LINEユーザーIDとアプリユーザーの紐付け
 */
export const lineUsers = pgTable(
  "line_users",
  {
    lineUserId: varchar("line_user_id", { length: 50 }).primaryKey(), // LINE UserID (U...)
    userId: uuid("user_id"), // Supabase Auth のユーザーID（紐付け後に設定）
    displayName: varchar("display_name", { length: 100 }), // LINE表示名
    notificationEnabled: integer("notification_enabled").default(1).notNull(), // 通知ON/OFF (1=ON, 0=OFF)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_line_users_user_id").on(table.userId),
  }),
);

export type LineUser = typeof lineUsers.$inferSelect;
export type NewLineUser = typeof lineUsers.$inferInsert;
