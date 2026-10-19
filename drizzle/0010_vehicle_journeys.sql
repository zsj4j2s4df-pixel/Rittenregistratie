CREATE TABLE `journey_observations` (
	`observation_id` text PRIMARY KEY NOT NULL,
	`journey_id` text NOT NULL,
	`linked_by` text NOT NULL,
	`linked_at` integer NOT NULL,
	FOREIGN KEY (`observation_id`) REFERENCES `detection_observations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`journey_id`) REFERENCES `vehicle_journeys`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`linked_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_journey_observations` ON `journey_observations` (`journey_id`,`observation_id`);--> statement-breakpoint
CREATE TABLE `journey_requests` (
	`vehicle_id` text NOT NULL,
	`user_id` text NOT NULL,
	`request_id` text NOT NULL,
	`operation` text NOT NULL,
	`request_json` text NOT NULL,
	`response_json` text NOT NULL,
	PRIMARY KEY(`vehicle_id`, `user_id`, `request_id`),
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "journey_operation" CHECK("journey_requests"."operation" IN ('create','join','close'))
);
--> statement-breakpoint
CREATE TABLE `vehicle_journeys` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`created_by` text NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`status` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`last_mutation_id` text NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "journey_start" CHECK(typeof("vehicle_journeys"."started_at")='integer' AND "vehicle_journeys"."started_at" BETWEEN 0 AND 253402300799),
	CONSTRAINT "journey_status" CHECK("vehicle_journeys"."status" IN ('review_open','review_closed')),
	CONSTRAINT "journey_revision" CHECK(typeof("vehicle_journeys"."revision")='integer' AND "vehicle_journeys"."revision" BETWEEN 0 AND 9007199254740991),
	CONSTRAINT "journey_end" CHECK(("vehicle_journeys"."status"='review_open' AND "vehicle_journeys"."ended_at" IS NULL) OR ("vehicle_journeys"."status"='review_closed' AND typeof("vehicle_journeys"."ended_at")='integer' AND "vehicle_journeys"."ended_at">"vehicle_journeys"."started_at" AND "vehicle_journeys"."ended_at"<=253402300799))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_vehicle_journey_open` ON `vehicle_journeys` (`vehicle_id`) WHERE "vehicle_journeys"."status"='review_open';--> statement-breakpoint
CREATE INDEX `idx_vehicle_journey_history` ON `vehicle_journeys` (`vehicle_id`,`created_at`,`id`);
--> statement-breakpoint
CREATE TRIGGER journey_observations_immutable BEFORE UPDATE ON journey_observations
BEGIN SELECT RAISE(ABORT,'journey_evidence_immutable'); END;
--> statement-breakpoint
CREATE TRIGGER journey_requests_immutable BEFORE UPDATE ON journey_requests
BEGIN SELECT RAISE(ABORT,'journey_receipt_immutable'); END;
--> statement-breakpoint
CREATE TRIGGER vehicle_journey_revision_guard BEFORE UPDATE ON vehicle_journeys
WHEN NEW.id IS NOT OLD.id OR NEW.vehicle_id IS NOT OLD.vehicle_id OR NEW.created_by IS NOT OLD.created_by OR NEW.started_at IS NOT OLD.started_at OR NEW.created_at IS NOT OLD.created_at OR NEW.revision!=OLD.revision+1 OR (OLD.status='review_closed' AND NEW.status!='review_closed')
BEGIN SELECT RAISE(ABORT,'journey_revision_or_scope_guard'); END;
