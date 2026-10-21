-- Additive upgrade: every existing address remains business with its original ID.
ALTER TABLE business_addresses ADD COLUMN kind TEXT NOT NULL DEFAULT 'business' CONSTRAINT address_kind CHECK(kind IN ('business','private'));
--> statement-breakpoint
ALTER TABLE business_addresses ADD COLUMN business_role TEXT CONSTRAINT address_business_role CHECK(business_role IS NULL OR (kind='business' AND business_role IN ('customer','supplier')));
