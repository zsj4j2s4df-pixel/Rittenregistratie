CREATE TABLE `journey_choices` (
	`vehicle_id` text NOT NULL,
	`user_id` text NOT NULL,
	`request_id` text NOT NULL,
	`journey_id` text NOT NULL,
	`expected_revision` integer NOT NULL,
	`revision` integer NOT NULL,
	`classification` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer NOT NULL,
	`request_json` text NOT NULL,
	`response_json` text NOT NULL,
	PRIMARY KEY(`vehicle_id`, `user_id`, `request_id`),
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`journey_id`) REFERENCES `vehicle_journeys`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "journey_choice_classification" CHECK("journey_choices"."classification" IN ('business','private')),
	CONSTRAINT "journey_choice_revision" CHECK(typeof("journey_choices"."expected_revision")='integer' AND "journey_choices"."expected_revision">=0 AND typeof("journey_choices"."revision")='integer' AND "journey_choices"."revision"="journey_choices"."expected_revision"+1 AND "journey_choices"."revision"<=9007199254740991)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_journey_choice_revision` ON `journey_choices` (`journey_id`,`revision`);--> statement-breakpoint
CREATE INDEX `idx_journey_choice_current` ON `journey_choices` (`journey_id`,`revision`);
--> statement-breakpoint
CREATE TRIGGER journey_choice_immutable BEFORE UPDATE ON journey_choices
BEGIN SELECT RAISE(ABORT,'journey_choice_immutable'); END;
