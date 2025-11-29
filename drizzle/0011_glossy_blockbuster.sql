CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" varchar(20) DEFAULT 'free' NOT NULL,
	"plan_started_at" timestamp DEFAULT now() NOT NULL,
	"plan_expires_at" timestamp,
	"stripe_customer_id" varchar(100),
	"stripe_subscription_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_user_id" ON "user_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_plan" ON "user_subscriptions" USING btree ("plan");--> statement-breakpoint
CREATE INDEX "idx_user_subscriptions_stripe_customer" ON "user_subscriptions" USING btree ("stripe_customer_id");