CREATE TABLE "market_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_type" varchar(20) NOT NULL,
	"analyzed_at" timestamp NOT NULL,
	"interest_rate_trend" text,
	"favorable_sectors" jsonb,
	"unfavorable_sectors" jsonb,
	"favorable_themes" jsonb,
	"unfavorable_themes" jsonb,
	"economic_summary" text,
	"llm_raw_response" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sector_code" varchar(10) NOT NULL,
	"sector_name" varchar(100) NOT NULL,
	"display_order" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sectors_sector_code_unique" UNIQUE("sector_code")
);
--> statement-breakpoint
CREATE INDEX "idx_market_analysis_period" ON "market_analysis" USING btree ("period_type");--> statement-breakpoint
CREATE INDEX "idx_market_analysis_analyzed_at" ON "market_analysis" USING btree ("analyzed_at");--> statement-breakpoint
CREATE INDEX "idx_sectors_code" ON "sectors" USING btree ("sector_code");