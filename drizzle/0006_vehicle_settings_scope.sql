ALTER TABLE `business_addresses` ADD `vehicle_id` text REFERENCES vehicles(id);--> statement-breakpoint
ALTER TABLE `mileage_rates` ADD `vehicle_id` text REFERENCES vehicles(id);--> statement-breakpoint
ALTER TABLE `mileage_rates` ADD `amount_micros` integer;--> statement-breakpoint
ALTER TABLE `vehicles` ADD `settings_revision` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `vehicles` ADD `settings_mutation_id` text;