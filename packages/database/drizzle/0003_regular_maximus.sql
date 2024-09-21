CREATE TABLE IF NOT EXISTS "allowedDomain" (
	"id" serial PRIMARY KEY NOT NULL,
	"domain" varchar(253) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "url" ADD COLUMN "count" smallint DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "url" ADD COLUMN "isDisabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "allowedDomain" ADD CONSTRAINT "allowedDomain_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "allowed_domain_udx" ON "allowedDomain" USING btree ("user_id","domain");