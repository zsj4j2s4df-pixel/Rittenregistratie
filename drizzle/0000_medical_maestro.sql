CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`old_value_json` text,
	`new_value_json` text,
	`occurred_at` integer NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_audit_entity_time` ON `audit_logs` (`entity_type`,`entity_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `business_addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`address` text NOT NULL,
	`latitude` real,
	`longitude` real,
	`radius_meters` integer DEFAULT 150 NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`notes` text,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `mileage_rates` (
	`id` text PRIMARY KEY NOT NULL,
	`amount_per_km` real NOT NULL,
	`valid_from` integer NOT NULL,
	`valid_until` integer,
	`source_url` text,
	`created_by` text NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_mileage_rates_valid_from` ON `mileage_rates` (`valid_from`);--> statement-breakpoint
CREATE TABLE `route_points` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` text NOT NULL,
	`recorded_at` integer NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`accuracy_meters` real,
	`source` text DEFAULT 'gps' NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_route_points_trip_time` ON `route_points` (`trip_id`,`recorded_at`);--> statement-breakpoint
CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`driver_id` text,
	`status` text DEFAULT 'provisional' NOT NULL,
	`classification` text DEFAULT 'review' NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`start_address` text,
	`end_address` text,
	`distance_km` real,
	`distance_source` text,
	`route_type` text DEFAULT 'recorded' NOT NULL,
	`purpose` text,
	`customer` text,
	`notes` text,
	`confidence` real,
	`needs_review` integer DEFAULT true NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_trips_vehicle_started` ON `trips` (`vehicle_id`,`started_at`);--> statement-breakpoint
CREATE INDEX `idx_trips_driver_started` ON `trips` (`driver_id`,`started_at`);--> statement-breakpoint
CREATE INDEX `idx_trips_classification_started` ON `trips` (`classification`,`started_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`external_auth_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`role` text DEFAULT 'admin_driver' NOT NULL,
	`driver_priority` integer NOT NULL,
	`theme` text DEFAULT 'dark' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_external_auth_id` ON `users` (`external_auth_id`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`registration_plate` text,
	`model_year` integer,
	`market_version` text,
	`verification_status` text DEFAULT 'unverified' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_vehicles_registration_plate` ON `vehicles` (`registration_plate`);