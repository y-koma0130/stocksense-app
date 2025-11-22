CREATE TABLE "stock_indicators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stock_id" uuid NOT NULL,
	"collected_at" date NOT NULL,
	"period_type" "period_type" NOT NULL,
	"current_price" numeric(10, 2),
	"per" numeric(10, 2),
	"pbr" numeric(10, 2),
	"rsi" numeric(5, 2),
	"week_52_high" numeric(10, 2),
	"week_52_low" numeric(10, 2),
	"sector_code" varchar(10),
	"sector_avg_per" numeric(10, 2),
	"sector_avg_pbr" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uniq_stock_collected_period" UNIQUE("stock_id","collected_at","period_type")
);
--> statement-breakpoint
ALTER TABLE "stock_indicators" ADD CONSTRAINT "stock_indicators_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_indicators_period_collected" ON "stock_indicators" USING btree ("period_type","collected_at");--> statement-breakpoint
CREATE INDEX "idx_indicators_stock" ON "stock_indicators" USING btree ("stock_id");