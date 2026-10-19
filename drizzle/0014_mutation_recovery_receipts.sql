CREATE TABLE `mutation_requests` (
	`vehicle_id` text NOT NULL,
	`user_id` text NOT NULL,
	`request_id` text NOT NULL,
	`operation` text NOT NULL,
	`entity_id` text NOT NULL,
	`request_json` text NOT NULL,
	`response_json` text NOT NULL,
	PRIMARY KEY(`vehicle_id`, `user_id`, `request_id`),
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "mutation_operation" CHECK("mutation_requests"."operation" IN ('trip-edit','settings')),
	CONSTRAINT "mutation_payload_size" CHECK(length(CAST("mutation_requests"."request_json" AS BLOB))<=16384 AND length(CAST("mutation_requests"."response_json" AS BLOB))<=65536)
);
--> statement-breakpoint
CREATE TRIGGER mutation_receipt_immutable_update BEFORE UPDATE ON mutation_requests
BEGIN SELECT RAISE(ABORT,'mutation_receipt_immutable'); END;
--> statement-breakpoint
CREATE TRIGGER mutation_receipt_immutable_delete BEFORE DELETE ON mutation_requests
BEGIN SELECT RAISE(ABORT,'mutation_receipt_immutable'); END;
--> statement-breakpoint
CREATE TRIGGER mutation_receipt_scope BEFORE INSERT ON mutation_requests
WHEN (NEW.operation='settings' AND NEW.entity_id!=NEW.vehicle_id)
 OR (NEW.operation='trip-edit' AND NOT EXISTS(SELECT 1 FROM trips WHERE id=NEW.entity_id AND vehicle_id=NEW.vehicle_id))
BEGIN SELECT RAISE(ABORT,'mutation_receipt_scope'); END;
