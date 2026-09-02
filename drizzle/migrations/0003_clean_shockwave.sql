CREATE TABLE "skincare_ritual_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" integer NOT NULL,
	"time_of_day" text NOT NULL,
	"instructions" text,
	"sort_order" integer DEFAULT 0,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sleep_naps" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"nap_date" date NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"duration_minutes" integer NOT NULL,
	"refresh_rating" integer,
	"notes" text,
	"logged_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sleep_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_sleep_minutes" integer DEFAULT 480 NOT NULL,
	"target_bedtime" text,
	"target_wake_time" text,
	"bedtime_reminder_enabled" boolean DEFAULT false NOT NULL,
	"bedtime_reminder_time" text,
	"wind_down_minutes" integer DEFAULT 30 NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sleep_logs" RENAME COLUMN "date" TO "sleep_date";--> statement-breakpoint
ALTER TABLE "skincare_logs" ADD COLUMN "ritual_step_id" integer;--> statement-breakpoint
ALTER TABLE "skincare_logs" ADD COLUMN "product_id" integer;--> statement-breakpoint
ALTER TABLE "skincare_logs" ADD COLUMN "completed_at" text;--> statement-breakpoint
ALTER TABLE "skincare_products" ADD COLUMN "brand" text;--> statement-breakpoint
ALTER TABLE "skincare_products" ADD COLUMN "instructions" text;--> statement-breakpoint
ALTER TABLE "skincare_products" ADD COLUMN "sort_order" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "skincare_products" ADD COLUMN "percent_remaining" integer DEFAULT 100;--> statement-breakpoint
ALTER TABLE "skincare_products" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "skincare_products" ADD COLUMN "opened_at" date;--> statement-breakpoint
ALTER TABLE "skincare_products" ADD COLUMN "expires_at" date;--> statement-breakpoint
ALTER TABLE "skincare_products" ADD COLUMN "on_shelf" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "bed_time" timestamp;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "attempted_sleep_time" timestamp;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "fell_asleep_time" timestamp;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "out_of_bed_time" timestamp;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "awakenings_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "awake_minutes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "sleep_quality" integer;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "morning_energy" integer;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "morning_mood" integer;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "had_late_caffeine" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "had_alcohol" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "had_late_meal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "had_workout" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "had_high_stress" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "had_late_screen_time" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "skincare_ritual_steps" ADD CONSTRAINT "skincare_ritual_steps_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skincare_ritual_steps" ADD CONSTRAINT "skincare_ritual_steps_product_id_skincare_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."skincare_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sleep_naps" ADD CONSTRAINT "sleep_naps_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sleep_settings" ADD CONSTRAINT "sleep_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sleep_naps_user_nap_date_idx" ON "sleep_naps" USING btree ("user_id","nap_date");--> statement-breakpoint
CREATE UNIQUE INDEX "sleep_settings_user_unique_idx" ON "sleep_settings" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "skincare_logs" ADD CONSTRAINT "skincare_logs_ritual_step_id_skincare_ritual_steps_id_fk" FOREIGN KEY ("ritual_step_id") REFERENCES "public"."skincare_ritual_steps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skincare_logs" ADD CONSTRAINT "skincare_logs_product_id_skincare_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."skincare_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sleep_logs_user_sleep_date_idx" ON "sleep_logs" USING btree ("user_id","sleep_date");--> statement-breakpoint
CREATE INDEX "sleep_logs_user_logged_at_idx" ON "sleep_logs" USING btree ("user_id","logged_at");--> statement-breakpoint
ALTER TABLE "sleep_logs" DROP COLUMN "bedtime";--> statement-breakpoint
ALTER TABLE "sleep_logs" DROP COLUMN "duration_minutes";--> statement-breakpoint
ALTER TABLE "sleep_logs" DROP COLUMN "quality";