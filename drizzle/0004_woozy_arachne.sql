CREATE TABLE "stock_financial_health" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stock_id" uuid NOT NULL,
	"equity_ratio" numeric(5, 2),
	"operating_income_decline_years" integer,
	"operating_cash_flow_negative_years" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stock_financial_health_stock_id_unique" UNIQUE("stock_id")
);
--> statement-breakpoint
DROP TABLE "stock_scores" CASCADE;--> statement-breakpoint
ALTER TABLE "stock_financial_health" ADD CONSTRAINT "stock_financial_health_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_financial_health_stock" ON "stock_financial_health" USING btree ("stock_id");--> statement-breakpoint
ALTER TABLE "stock_indicators" DROP COLUMN "equity_ratio";--> statement-breakpoint
ALTER TABLE "stock_indicators" DROP COLUMN "operating_income_growth";--> statement-breakpoint
ALTER TABLE "stock_indicators" DROP COLUMN "operating_income_decline_years";--> statement-breakpoint
ALTER TABLE "stock_indicators" DROP COLUMN "operating_cash_flow_negative_years";--> statement-breakpoint
DROP TYPE "public"."score_type";