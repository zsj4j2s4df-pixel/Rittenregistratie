CREATE TABLE `detection_ingest_requests` (
	`vehicle_id` text NOT NULL,
	`user_id` text NOT NULL,
	`device_id` text NOT NULL,
	`request_id` text NOT NULL,
	`observation_id` text NOT NULL,
	`canonical_json` text NOT NULL,
	PRIMARY KEY(`vehicle_id`, `user_id`, `device_id`, `request_id`),
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`device_id`) REFERENCES `registered_devices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`observation_id`) REFERENCES `detection_observations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `detection_observations` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`user_id` text NOT NULL,
	`device_id` text NOT NULL,
	`event_id` text NOT NULL,
	`observed_at` integer NOT NULL,
	`received_at` integer NOT NULL,
	`source` text NOT NULL,
	`event_kind` text NOT NULL,
	`uncertainty` text NOT NULL,
	`payload_json` text NOT NULL,
	`canonical_json` text NOT NULL,
	`mutation_id` text NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`device_id`) REFERENCES `registered_devices`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "detection_observed_time" CHECK(typeof("detection_observations"."observed_at")='integer' AND "detection_observations"."observed_at" BETWEEN 0 AND 253402300799),
	CONSTRAINT "detection_received_time" CHECK(typeof("detection_observations"."received_at")='integer' AND "detection_observations"."received_at" BETWEEN 0 AND 253402300799),
	CONSTRAINT "detection_source" CHECK("detection_observations"."source" IN ('gps','bluetooth','carplay','manual')),
	CONSTRAINT "detection_kind" CHECK("detection_observations"."event_kind" IN ('location','start_candidate','end_candidate','connection','disconnection')),
	CONSTRAINT "detection_uncertainty" CHECK("detection_observations"."uncertainty"='unverified_app_observation'),
	CONSTRAINT "detection_payload_size" CHECK(length(CAST("detection_observations"."payload_json" AS BLOB))<=16384),
	CONSTRAINT "detection_canonical_size" CHECK(length(CAST("detection_observations"."canonical_json" AS BLOB))<=16384)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_detection_event` ON `detection_observations` (`device_id`,`event_id`);--> statement-breakpoint
CREATE INDEX `idx_detection_device_time` ON `detection_observations` (`device_id`,`received_at`,`id`);
--> statement-breakpoint
CREATE TRIGGER detection_observations_immutable BEFORE UPDATE ON detection_observations
BEGIN SELECT RAISE(ABORT,'detection_observation_immutable'); END;
