CREATE TYPE "public"."supplement_status" AS ENUM('taken', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."supplement_time" AS ENUM('morning', 'afternoon', 'evening', 'night');--> statement-breakpoint
ALTER TABLE "vitamin_logs" DROP CONSTRAINT "vitamin_logs_vitamin_id_vitamins_id_fk";
--> statement-breakpoint
ALTER TABLE "vitamin_logs" ALTER COLUMN "vitamin_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vitamins" ALTER COLUMN "frequency" SET DEFAULT 'daily';--> statement-breakpoint
ALTER TABLE "vitamins" ALTER COLUMN "time_of_day" SET DEFAULT 'morning'::"public"."supplement_time";--> statement-breakpoint
ALTER TABLE "vitamins" ALTER COLUMN "time_of_day" SET DATA TYPE "public"."supplement_time" USING "time_of_day"::"public"."supplement_time";--> statement-breakpoint
ALTER TABLE "vitamins" ALTER COLUMN "time_of_day" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vitamin_logs" ADD COLUMN "status" "supplement_status" DEFAULT 'taken' NOT NULL;--> statement-breakpoint
ALTER TABLE "vitamin_logs" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "vitamins" ADD COLUMN "unit" text;--> statement-breakpoint
ALTER TABLE "vitamins" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "vitamins" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "vitamins" ADD COLUMN "with_food" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "vitamin_logs" ADD CONSTRAINT "vitamin_logs_vitamin_id_vitamins_id_fk" FOREIGN KEY ("vitamin_id") REFERENCES "public"."vitamins"("id") ON DELETE cascade ON UPDATE no action;