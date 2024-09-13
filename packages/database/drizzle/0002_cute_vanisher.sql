ALTER TABLE "urls" RENAME TO "url";--> statement-breakpoint
ALTER TABLE "url" DROP CONSTRAINT "urls_userId_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "url" ADD CONSTRAINT "url_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
