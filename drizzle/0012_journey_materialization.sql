CREATE TABLE `journey_materializations` (
	`journey_id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`trip_id` text NOT NULL,
	`user_id` text NOT NULL,
	`request_id` text NOT NULL,
	`source_revision` integer NOT NULL,
	`revision` integer NOT NULL,
	`created_at` integer NOT NULL,
	`request_json` text NOT NULL,
	`response_json` text NOT NULL,
	FOREIGN KEY (`journey_id`) REFERENCES `vehicle_journeys`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "materialization_revision" CHECK(typeof("journey_materializations"."source_revision")='integer' AND "journey_materializations"."source_revision">=0 AND typeof("journey_materializations"."revision")='integer' AND "journey_materializations"."revision"="journey_materializations"."source_revision"+1 AND "journey_materializations"."revision"<=9007199254740991),
	CONSTRAINT "materialization_request_size" CHECK(length(CAST("journey_materializations"."request_json" AS BLOB))<=16384 AND length(CAST("journey_materializations"."response_json" AS BLOB))<=16384)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_materialization_trip` ON `journey_materializations` (`trip_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_materialization_request` ON `journey_materializations` (`vehicle_id`,`user_id`,`request_id`);--> statement-breakpoint
CREATE TRIGGER materialization_scope BEFORE INSERT ON journey_materializations
WHEN NOT EXISTS(SELECT 1 FROM vehicle_journeys j JOIN trips t ON t.id=NEW.trip_id WHERE j.id=NEW.journey_id AND j.vehicle_id=NEW.vehicle_id AND j.status='review_closed' AND j.revision=NEW.revision AND t.vehicle_id=NEW.vehicle_id AND t.created_by=NEW.user_id)
BEGIN SELECT RAISE(ABORT,'materialization_scope'); END;
--> statement-breakpoint
CREATE TRIGGER materialization_immutable_update BEFORE UPDATE ON journey_materializations
BEGIN SELECT RAISE(ABORT,'materialization_immutable'); END;
--> statement-breakpoint
CREATE TRIGGER materialization_immutable_delete BEFORE DELETE ON journey_materializations
BEGIN SELECT RAISE(ABORT,'materialization_immutable'); END;
--> statement-breakpoint
CREATE TRIGGER materialized_journey_locked BEFORE UPDATE ON vehicle_journeys
WHEN EXISTS(SELECT 1 FROM journey_materializations m WHERE m.journey_id=OLD.id)
BEGIN SELECT RAISE(ABORT,'materialized_journey_locked'); END;
--> statement-breakpoint
CREATE TRIGGER materialized_trip_scope_locked BEFORE UPDATE ON trips
WHEN EXISTS(SELECT 1 FROM journey_materializations m WHERE m.trip_id=OLD.id)
 AND (NEW.id IS NOT OLD.id OR NEW.vehicle_id IS NOT OLD.vehicle_id OR NEW.created_by IS NOT OLD.created_by)
BEGIN SELECT RAISE(ABORT,'materialized_trip_scope_locked'); END;
