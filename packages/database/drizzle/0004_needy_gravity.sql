ALTER TABLE "url" ADD COLUMN "allowedDomainId" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "url" ADD CONSTRAINT "url_allowedDomainId_allowedDomain_id_fk" FOREIGN KEY ("allowedDomainId") REFERENCES "public"."allowedDomain"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
