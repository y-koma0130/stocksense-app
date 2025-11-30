CREATE TABLE "line_stock_analysis_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"line_user_id" varchar(50) NOT NULL,
	"stock_id" uuid NOT NULL,
	"ticker_code" varchar(10) NOT NULL,
	"period_type" varchar(20) NOT NULL,
	"analyzed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "line_stock_analysis_usage" ADD CONSTRAINT "line_stock_analysis_usage_line_user_id_line_users_line_user_id_fk" FOREIGN KEY ("line_user_id") REFERENCES "public"."line_users"("line_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "line_stock_analysis_usage" ADD CONSTRAINT "line_stock_analysis_usage_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_line_stock_analysis_usage_line_user" ON "line_stock_analysis_usage" USING btree ("line_user_id");--> statement-breakpoint
CREATE INDEX "idx_line_stock_analysis_usage_stock" ON "line_stock_analysis_usage" USING btree ("stock_id");--> statement-breakpoint
CREATE INDEX "idx_line_stock_analysis_usage_analyzed_at" ON "line_stock_analysis_usage" USING btree ("analyzed_at");