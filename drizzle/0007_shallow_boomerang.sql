CREATE TABLE "long_term_indicators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stock_id" uuid NOT NULL,
	"collected_at" date NOT NULL,
	"current_price" numeric(10, 2),
	"per" numeric(10, 2),
	"pbr" numeric(10, 2),
	"rsi" numeric(5, 2),
	"price_high" numeric(10, 2),
	"price_low" numeric(10, 2),
	"sector_code" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uniq_long_term_stock_collected" UNIQUE("stock_id","collected_at")
);
--> statement-breakpoint
CREATE TABLE "mid_term_indicators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stock_id" uuid NOT NULL,
	"collected_at" date NOT NULL,
	"current_price" numeric(10, 2),
	"per" numeric(10, 2),
	"pbr" numeric(10, 2),
	"rsi" numeric(5, 2),
	"price_high" numeric(10, 2),
	"price_low" numeric(10, 2),
	"sector_code" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uniq_mid_term_stock_collected" UNIQUE("stock_id","collected_at")
);
--> statement-breakpoint
DROP TABLE "stock_indicators" CASCADE;--> statement-breakpoint
ALTER TABLE "long_term_indicators" ADD CONSTRAINT "long_term_indicators_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mid_term_indicators" ADD CONSTRAINT "mid_term_indicators_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_long_term_collected" ON "long_term_indicators" USING btree ("collected_at");--> statement-breakpoint
CREATE INDEX "idx_long_term_stock" ON "long_term_indicators" USING btree ("stock_id");--> statement-breakpoint
CREATE INDEX "idx_mid_term_collected" ON "mid_term_indicators" USING btree ("collected_at");--> statement-breakpoint
CREATE INDEX "idx_mid_term_stock" ON "mid_term_indicators" USING btree ("stock_id");--> statement-breakpoint
DROP TYPE "public"."period_type";