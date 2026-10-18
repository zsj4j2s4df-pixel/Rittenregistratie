CREATE TABLE `report_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`request_id` text NOT NULL,
	`request_json` text NOT NULL,
	`snapshot_json` text NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_report_request` ON `report_snapshots` (`vehicle_id`,`created_by`,`request_id`);--> statement-breakpoint
CREATE INDEX `idx_report_vehicle_time` ON `report_snapshots` (`vehicle_id`,`created_at`);
--> statement-breakpoint
CREATE TRIGGER report_snapshots_immutable BEFORE UPDATE ON report_snapshots
BEGIN SELECT RAISE(ABORT, 'report_snapshot_immutable'); END;
