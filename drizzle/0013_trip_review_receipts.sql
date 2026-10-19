CREATE TABLE `trip_review_requests` (
	`vehicle_id` text NOT NULL,
	`user_id` text NOT NULL,
	`request_id` text NOT NULL,
	`trip_id` text NOT NULL,
	`expected_revision` integer NOT NULL,
	`revision` integer NOT NULL,
	`request_json` text NOT NULL,
	`response_json` text NOT NULL,
	PRIMARY KEY(`vehicle_id`, `user_id`, `request_id`),
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "trip_review_revision" CHECK(typeof("trip_review_requests"."expected_revision")='integer' AND "trip_review_requests"."expected_revision">=0 AND typeof("trip_review_requests"."revision")='integer' AND "trip_review_requests"."revision"="trip_review_requests"."expected_revision"+1 AND "trip_review_requests"."revision"<=9007199254740991)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_trip_review_revision` ON `trip_review_requests` (`trip_id`,`revision`);--> statement-breakpoint
CREATE TRIGGER trip_review_receipt_immutable_update BEFORE UPDATE ON trip_review_requests
BEGIN SELECT RAISE(ABORT,'trip_review_receipt_immutable'); END;
--> statement-breakpoint
CREATE TRIGGER trip_review_receipt_immutable_delete BEFORE DELETE ON trip_review_requests
BEGIN SELECT RAISE(ABORT,'trip_review_receipt_immutable'); END;
--> statement-breakpoint
CREATE TRIGGER trip_review_receipt_scope BEFORE INSERT ON trip_review_requests
WHEN NOT EXISTS(SELECT 1 FROM trips t WHERE t.id=NEW.trip_id AND t.vehicle_id=NEW.vehicle_id AND t.revision=NEW.revision AND t.status='final' AND t.needs_review=0)
BEGIN SELECT RAISE(ABORT,'trip_review_receipt_scope'); END;
