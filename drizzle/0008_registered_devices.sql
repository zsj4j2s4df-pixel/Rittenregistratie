CREATE TABLE `device_register_requests` (
	`vehicle_id` text NOT NULL,
	`user_id` text NOT NULL,
	`request_id` text NOT NULL,
	`device_id` text NOT NULL,
	`request_json` text NOT NULL,
	`response_json` text NOT NULL,
	PRIMARY KEY(`vehicle_id`, `user_id`, `request_id`),
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`device_id`) REFERENCES `registered_devices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `registered_devices` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`vehicle_id` text NOT NULL,
	`name` text NOT NULL,
	`platform` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`last_mutation_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "device_platform" CHECK("registered_devices"."platform" IN ('ios','web')),
	CONSTRAINT "device_active" CHECK("registered_devices"."active" IN (0,1)),
	CONSTRAINT "device_revision" CHECK(typeof("registered_devices"."revision")='integer' AND "registered_devices"."revision" BETWEEN 0 AND 9007199254740991)
);
--> statement-breakpoint
CREATE INDEX `idx_registered_devices_owner_vehicle` ON `registered_devices` (`user_id`,`vehicle_id`,`id`);