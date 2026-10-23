CREATE TABLE `auth_attempts` (
	`bucket` integer NOT NULL,
	`ip_hash` text NOT NULL,
	`attempts` integer NOT NULL,
	PRIMARY KEY(`bucket`, `ip_hash`)
);
--> statement-breakpoint
CREATE TABLE `auth_browser_bindings` (
	`id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`issuer` text NOT NULL,
	`user_id` text NOT NULL,
	`session_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `auth_identities` (
	`issuer` text NOT NULL,
	`subject` text NOT NULL,
	`user_id` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`issuer`, `subject`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "auth_identity_active" CHECK("auth_identities"."active" IN (0,1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_auth_identity_user` ON `auth_identities` (`issuer`,`user_id`);--> statement-breakpoint
CREATE TABLE `auth_session_revocations` (
	`issuer` text NOT NULL,
	`session_id` text NOT NULL,
	`revoked_at` integer NOT NULL,
	PRIMARY KEY(`issuer`, `session_id`)
);
