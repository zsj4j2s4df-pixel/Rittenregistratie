CREATE TABLE `vehicle_memberships` (
	`user_id` text NOT NULL,
	`vehicle_id` text NOT NULL,
	`role` text DEFAULT 'admin_driver' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	PRIMARY KEY(`user_id`, `vehicle_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `trips` ADD `revision` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `last_mutation_id` text;--> statement-breakpoint
ALTER TABLE `trips` ADD `odometer_start` real;--> statement-breakpoint
ALTER TABLE `trips` ADD `odometer_end` real;--> statement-breakpoint
ALTER TABLE `users` ADD `disabled` integer DEFAULT false NOT NULL;