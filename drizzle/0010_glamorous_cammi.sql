ALTER TABLE "stock_analyses" RENAME COLUMN "rationale" TO "summary";--> statement-breakpoint
ALTER TABLE "stock_analyses" RENAME COLUMN "strengths" TO "investment_points";--> statement-breakpoint
ALTER TABLE "stock_analyses" DROP COLUMN "financial_analysis";--> statement-breakpoint
ALTER TABLE "stock_analyses" DROP COLUMN "sector_position";