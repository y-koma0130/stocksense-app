CREATE TABLE "filter_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"markets" text[],
	"sector_codes" text[],
	"price_min" integer,
	"price_max" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "filter_lists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_notification_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"notification_target_list_id" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_notification_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_notification_target_list_id_filter_lists_id_fk" FOREIGN KEY ("notification_target_list_id") REFERENCES "public"."filter_lists"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_filter_lists_user_id" ON "filter_lists" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "filter_lists_select_own" ON "filter_lists" AS PERMISSIVE FOR SELECT TO public USING (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "filter_lists_insert_own" ON "filter_lists" AS PERMISSIVE FOR INSERT TO public WITH CHECK (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "filter_lists_update_own" ON "filter_lists" AS PERMISSIVE FOR UPDATE TO public USING (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "filter_lists_delete_own" ON "filter_lists" AS PERMISSIVE FOR DELETE TO public USING (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "user_notification_settings_select_own" ON "user_notification_settings" AS PERMISSIVE FOR SELECT TO public USING (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "user_notification_settings_insert_own" ON "user_notification_settings" AS PERMISSIVE FOR INSERT TO public WITH CHECK (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "user_notification_settings_update_own" ON "user_notification_settings" AS PERMISSIVE FOR UPDATE TO public USING (user_id = auth.uid());