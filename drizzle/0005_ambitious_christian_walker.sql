CREATE TABLE "line_users" (
	"line_user_id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"display_name" varchar(100),
	"notification_enabled" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_line_users_user_id" ON "line_users" USING btree ("user_id");