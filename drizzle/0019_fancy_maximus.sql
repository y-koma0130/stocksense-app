ALTER TABLE "line_stock_analysis_usage" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "line_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "line_stock_analysis_usage_select_own" ON "line_stock_analysis_usage" AS PERMISSIVE FOR SELECT TO public USING (EXISTS (
        SELECT 1 FROM line_users
        WHERE line_users.line_user_id = line_stock_analysis_usage.line_user_id
          AND line_users.user_id = auth.uid()
      ));--> statement-breakpoint
CREATE POLICY "line_users_select_own" ON "line_users" AS PERMISSIVE FOR SELECT TO public USING (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "line_users_update_own" ON "line_users" AS PERMISSIVE FOR UPDATE TO public USING (user_id = auth.uid());--> statement-breakpoint
CREATE POLICY "user_subscriptions_select_own" ON "user_subscriptions" AS PERMISSIVE FOR SELECT TO public USING (user_id = auth.uid());