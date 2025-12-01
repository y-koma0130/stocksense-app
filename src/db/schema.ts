import {
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * 1. 業種マスター
 * TOPIX 33業種分類
 */
export const sectors = pgTable(
  "sectors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sectorCode: varchar("sector_code", { length: 10 }).notNull().unique(), // 業種コード (e.g., "3050")
    sectorName: varchar("sector_name", { length: 100 }).notNull(), // 業種名 (e.g., "情報・通信業")
    displayOrder: integer("display_order"), // 表示順序
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    sectorCodeIdx: index("idx_sectors_code").on(table.sectorCode),
  }),
);

export type Sector = typeof sectors.$inferSelect;
export type NewSector = typeof sectors.$inferInsert;

/**
 * 2. 銘柄マスター
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
 * 3. 業種平均PER/PBR
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
 * 4. 中期指標データ（1-6ヶ月向け）
 * - RSI: 14週（ベース）、2週（短期）
 * - RSIモメンタム: 2週RSI - 14週RSI
 * - 価格レンジ: 26週（約6ヶ月）
 */
export const midTermIndicators = pgTable(
  "mid_term_indicators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    collectedAt: date("collected_at").notNull(),

    // 財務指標
    currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
    per: decimal("per", { precision: 10, scale: 2 }),
    pbr: decimal("pbr", { precision: 10, scale: 2 }),

    // テクニカル指標（週足・14週RSI）
    rsi: decimal("rsi", { precision: 5, scale: 2 }),

    // テクニカル指標（週足・2週RSI - 短期モメンタム用）
    rsiShort: decimal("rsi_short", { precision: 5, scale: 2 }),

    // 価格レンジ指標（26週）
    priceHigh: decimal("price_high", { precision: 10, scale: 2 }),
    priceLow: decimal("price_low", { precision: 10, scale: 2 }),

    // 出来高指標（罠株除外・スコアリング用）
    avgVolumeShort: decimal("avg_volume_short", { precision: 15, scale: 0 }), // 短期平均出来高
    avgVolumeLong: decimal("avg_volume_long", { precision: 15, scale: 0 }), // 長期平均出来高

    // 業種コード（sector_averages参照用）
    sectorCode: varchar("sector_code", { length: 10 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    collectedIdx: index("idx_mid_term_collected").on(table.collectedAt),
    stockIdx: index("idx_mid_term_stock").on(table.stockId),
    uniqStockCollected: unique("uniq_mid_term_stock_collected").on(
      table.stockId,
      table.collectedAt,
    ),
  }),
);

/**
 * 5. 長期指標データ（6ヶ月-3年向け）
 * - RSI: 52週
 * - 価格レンジ: 52週（1年）
 */
export const longTermIndicators = pgTable(
  "long_term_indicators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    collectedAt: date("collected_at").notNull(),

    // 財務指標
    currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
    per: decimal("per", { precision: 10, scale: 2 }),
    pbr: decimal("pbr", { precision: 10, scale: 2 }),

    // テクニカル指標（週足・52週RSI）
    rsi: decimal("rsi", { precision: 5, scale: 2 }),

    // 価格レンジ指標（52週）
    priceHigh: decimal("price_high", { precision: 10, scale: 2 }),
    priceLow: decimal("price_low", { precision: 10, scale: 2 }),

    // 出来高指標（罠株除外用）
    avgVolumeShort: decimal("avg_volume_short", { precision: 15, scale: 0 }), // 短期平均出来高

    // 業種コード（sector_averages参照用）
    sectorCode: varchar("sector_code", { length: 10 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    collectedIdx: index("idx_long_term_collected").on(table.collectedAt),
    stockIdx: index("idx_long_term_stock").on(table.stockId),
    uniqStockCollected: unique("uniq_long_term_stock_collected").on(
      table.stockId,
      table.collectedAt,
    ),
  }),
);

/**
 * 6. 銘柄財務健全性データ
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
    // EPS成長率計算用（長期スコアリング用）
    epsLatest: decimal("eps_latest", { precision: 10, scale: 2 }), // 最新年度のEPS
    eps3yAgo: decimal("eps_3y_ago", { precision: 10, scale: 2 }), // 3年前のEPS
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

export type MidTermIndicator = typeof midTermIndicators.$inferSelect;
export type NewMidTermIndicator = typeof midTermIndicators.$inferInsert;

export type LongTermIndicator = typeof longTermIndicators.$inferSelect;
export type NewLongTermIndicator = typeof longTermIndicators.$inferInsert;

export type StockFinancialHealth = typeof stockFinancialHealth.$inferSelect;
export type NewStockFinancialHealth = typeof stockFinancialHealth.$inferInsert;

/**
 * 7. LINE連携ユーザー
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

/**
 * 8. マーケット分析データ
 * LLMによる市場環境・セクター分析結果
 */
export const marketAnalysis = pgTable(
  "market_analysis",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    periodType: varchar("period_type", { length: 20 }).notNull(), // "mid_term" | "long_term"
    analyzedAt: timestamp("analyzed_at").notNull(),

    // 金利動向分析（日銀政策、米国金利影響）
    interestRateTrend: text("interest_rate_trend"),

    // 注目セクター（JSONB: {sectorCode: string, sectorName: string, reason: string}[]）
    favorableSectors: jsonb("favorable_sectors"),

    // 注意セクター（JSONB: {sectorCode: string, sectorName: string, reason: string}[]）
    unfavorableSectors: jsonb("unfavorable_sectors"),

    // 注目テーマ・事業内容（JSONB: {theme: string, description: string}[]）
    favorableThemes: jsonb("favorable_themes"),

    // 注意テーマ・事業内容（JSONB: {theme: string, description: string}[]）
    unfavorableThemes: jsonb("unfavorable_themes"),

    // 経済・マーケット総括
    economicSummary: text("economic_summary"),

    // LLM生レスポンス（デバッグ・監査用）
    llmRawResponse: jsonb("llm_raw_response"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    periodTypeIdx: index("idx_market_analysis_period").on(table.periodType),
    analyzedAtIdx: index("idx_market_analysis_analyzed_at").on(table.analyzedAt),
  }),
);

export type MarketAnalysis = typeof marketAnalysis.$inferSelect;
export type NewMarketAnalysis = typeof marketAnalysis.$inferInsert;

/**
 * 9. 個別株分析データ
 * LLMによる個別銘柄の投資分析結果
 */
export const stockAnalyses = pgTable(
  "stock_analyses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    periodType: varchar("period_type", { length: 20 }).notNull(), // "mid_term" | "long_term"
    analyzedAt: timestamp("analyzed_at").notNull(),

    // バリュー株としての評価（5段階、上位銘柄間の相対評価）
    valueStockRating: varchar("value_stock_rating", { length: 20 }), // "excellent" | "good" | "fair" | "poor" | "very_poor"

    // 総合評価コメント（100-400字）
    summary: text("summary"),

    // 投資する場合の魅力ポイント（JSONB: string[]、3-4項目、各100字以内）
    investmentPoints: jsonb("investment_points"),

    // 注意すべきリスク（JSONB: string[]、2-3項目、各100字以内）
    risks: jsonb("risks"),

    // LLM生レスポンス（デバッグ・監査用）
    llmRawResponse: text("llm_raw_response"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    stockIdx: index("idx_stock_analyses_stock").on(table.stockId),
    periodTypeIdx: index("idx_stock_analyses_period").on(table.periodType),
    analyzedAtIdx: index("idx_stock_analyses_analyzed_at").on(table.analyzedAt),
    stockPeriodIdx: index("idx_stock_analyses_stock_period").on(
      table.stockId,
      table.periodType,
      table.analyzedAt,
    ),
  }),
);

export type StockAnalysis = typeof stockAnalyses.$inferSelect;
export type NewStockAnalysis = typeof stockAnalyses.$inferInsert;

/**
 * 10. ユーザーサブスクリプション
 * Supabase AuthユーザーのプランとStripe連携情報
 */
export const userSubscriptions = pgTable(
  "user_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().unique(), // Supabase Auth の user.id
    plan: varchar("plan", { length: 20 }).notNull().default("free"), // "free" | "standard" | "pro"
    planStartedAt: timestamp("plan_started_at").defaultNow().notNull(), // プラン開始日時
    planExpiresAt: timestamp("plan_expires_at"), // 有効期限（nullなら無期限）
    stripeCustomerId: varchar("stripe_customer_id", { length: 100 }), // Stripe Customer ID
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 100 }), // Stripe Subscription ID
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("idx_user_subscriptions_user_id").on(table.userId),
    planIdx: index("idx_user_subscriptions_plan").on(table.plan),
    stripeCustomerIdx: index("idx_user_subscriptions_stripe_customer").on(table.stripeCustomerId),
  }),
);

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;

/**
 * 11. LINE銘柄分析履歴
 * LINEユーザーごとの分析履歴を記録（利用回数カウント・履歴参照用）
 */
export const lineStockAnalysisUsage = pgTable(
  "line_stock_analysis_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lineUserId: varchar("line_user_id", { length: 50 })
      .notNull()
      .references(() => lineUsers.lineUserId, { onDelete: "cascade" }),
    stockId: uuid("stock_id")
      .notNull()
      .references(() => stocks.id, { onDelete: "cascade" }),
    tickerCode: varchar("ticker_code", { length: 10 }).notNull(), // 検索用に非正規化
    periodType: varchar("period_type", { length: 20 }).notNull(), // mid_term or long_term
    analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
  },
  (table) => ({
    lineUserIdIdx: index("idx_line_stock_analysis_usage_line_user").on(table.lineUserId),
    stockIdIdx: index("idx_line_stock_analysis_usage_stock").on(table.stockId),
    analyzedAtIdx: index("idx_line_stock_analysis_usage_analyzed_at").on(table.analyzedAt),
  }),
);

export type LineStockAnalysisUsage = typeof lineStockAnalysisUsage.$inferSelect;
export type NewLineStockAnalysisUsage = typeof lineStockAnalysisUsage.$inferInsert;
