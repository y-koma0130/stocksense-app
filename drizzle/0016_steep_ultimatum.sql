CREATE TABLE "stock_macro_tags" (
	"stock_id" uuid NOT NULL,
	"macro_tag_id" varchar(50) NOT NULL,
	"confidence" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pk_stock_macro_tags" UNIQUE("stock_id","macro_tag_id")
);
--> statement-breakpoint
CREATE TABLE "stock_theme_tags" (
	"stock_id" uuid NOT NULL,
	"theme_tag_id" varchar(50) NOT NULL,
	"confidence" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pk_stock_theme_tags" UNIQUE("stock_id","theme_tag_id")
);
--> statement-breakpoint
ALTER TABLE "stocks" ADD COLUMN "large_sector_code" varchar(10);--> statement-breakpoint
ALTER TABLE "stocks" ADD COLUMN "large_sector_name" varchar(100);--> statement-breakpoint
ALTER TABLE "stock_macro_tags" ADD CONSTRAINT "stock_macro_tags_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_theme_tags" ADD CONSTRAINT "stock_theme_tags_stock_id_stocks_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_stock_macro_tags_stock" ON "stock_macro_tags" USING btree ("stock_id");--> statement-breakpoint
CREATE INDEX "idx_stock_macro_tags_tag" ON "stock_macro_tags" USING btree ("macro_tag_id");--> statement-breakpoint
CREATE INDEX "idx_stock_theme_tags_stock" ON "stock_theme_tags" USING btree ("stock_id");--> statement-breakpoint
CREATE INDEX "idx_stock_theme_tags_tag" ON "stock_theme_tags" USING btree ("theme_tag_id");--> statement-breakpoint
CREATE INDEX "idx_stocks_large_sector" ON "stocks" USING btree ("large_sector_code");