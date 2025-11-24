CREATE TYPE "public"."score_type" AS ENUM('mid_term', 'long_term');--> statement-breakpoint
CREATE TABLE "sector_averages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sector_code" varchar(10) NOT NULL,
	"data_date" date NOT NULL,
	"avg_per" numeric(10, 2),
	"avg_pbr" numeric(10, 2),
	"median_per" numeric(10, 2),
	"median_pbr" numeric(10, 2),
	"stock_count" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uniq_sector_date" UNIQUE("sector_code","data_date")
);
--> statement-breakpoint
CREATE TABLE "stock_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stock_id" uuid NOT NULL,
	"score_date" date NOT NULL,
	"score_type" "score_type" NOT NULL,
	"per_score" integer NOT NULL,
	"pbr_score" integer NOT NULL,
	"rsi_score" integer NOT NULL,
	"price_range_score" integer NOT NULL,
	"sector_score" numeric(5, 2) NOT NULL,
	"total_score" numeric(5, 4) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uniq_stock_date_type" UNIQUE("stock_id","score_date","score_type")
);
--> statement-breakpoint
CREATE TABLE "stocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticker_code" varchar(10) NOT NULL,
	"ticker_symbol" varchar(20) NOT NULL,
	"name" varchar(200) NOT NULL,
	"sector_code" varchar(10),
	"sector_name" varchar(100),
	"market" varchar(50),
	"listing_date" date,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stocks_ticker_code_unique" UNIQUE("ticker_code")
);
--> statement-breakpoint
ALTER TABLE "stock_scores" ADD CONSTRAINT "stock_scores_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sector_avg_date" ON "sector_averages" USING btree ("data_date");--> statement-breakpoint
CREATE INDEX "idx_sector_avg_code" ON "sector_averages" USING btree ("sector_code","data_date");--> statement-breakpoint
CREATE INDEX "idx_scores_type_total" ON "stock_scores" USING btree ("score_type","total_score","score_date");--> statement-breakpoint
CREATE INDEX "idx_scores_stock" ON "stock_scores" USING btree ("stock_id","score_date");--> statement-breakpoint
CREATE INDEX "idx_scores_date" ON "stock_scores" USING btree ("score_date","total_score");--> statement-breakpoint
CREATE INDEX "idx_stocks_sector" ON "stocks" USING btree ("sector_code");--> statement-breakpoint
CREATE INDEX "idx_stocks_market" ON "stocks" USING btree ("market");--> statement-breakpoint
CREATE INDEX "idx_stocks_ticker_symbol" ON "stocks" USING btree ("ticker_symbol");--> statement-breakpoint
CREATE INDEX "idx_stocks_deleted" ON "stocks" USING btree ("deleted_at");