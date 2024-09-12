CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"userName" varchar(12) NOT NULL,
	"displayName" varchar(24) NOT NULL,
	"email" varchar(256) NOT NULL,
	"firebaseUid" varchar(36) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" varchar(1024) NOT NULL,
	"pageTitle" varchar(256),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"userId" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "urls" ADD CONSTRAINT "urls_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "userName" ON "user" USING btree ("userName");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "emailIdx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "firebaseUidIdx" ON "user" USING btree ("firebaseUid");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "urlIdx" ON "urls" USING btree ("userId","url");