CREATE TABLE "stock_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stock_id" uuid NOT NULL,
	"period_type" varchar(20) NOT NULL,
	"analyzed_at" timestamp NOT NULL,
	"value_stock_rating" varchar(20),
	"rationale" text,
	"strengths" jsonb,
	"risks" jsonb,
	"financial_analysis" text,
	"sector_position" text,
	"llm_raw_response" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stock_analyses" ADD CONSTRAINT "stock_analyses_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_stock_analyses_stock" ON "stock_analyses" USING btree ("stock_id");--> statement-breakpoint
CREATE INDEX "idx_stock_analyses_period" ON "stock_analyses" USING btree ("period_type");--> statement-breakpoint
CREATE INDEX "idx_stock_analyses_analyzed_at" ON "stock_analyses" USING btree ("analyzed_at");--> statement-breakpoint
CREATE INDEX "idx_stock_analyses_stock_period" ON "stock_analyses" USING btree ("stock_id","period_type","analyzed_at");