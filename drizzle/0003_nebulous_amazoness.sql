ALTER TABLE "stock_indicators" ADD COLUMN "equity_ratio" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "stock_indicators" ADD COLUMN "operating_income_growth" numeric(10, 4);--> statement-breakpoint
ALTER TABLE "stock_indicators" ADD COLUMN "operating_income_decline_years" integer;--> statement-breakpoint
ALTER TABLE "stock_indicators" ADD COLUMN "operating_cash_flow_negative_years" integer;