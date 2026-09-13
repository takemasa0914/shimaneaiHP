CREATE TABLE `business_registrations` (
	`request_id` text PRIMARY KEY NOT NULL,
	`receipt` text NOT NULL,
	`created_at` text NOT NULL,
	`organization` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`department` text NOT NULL,
	`location` text NOT NULL,
	`participation` text NOT NULL,
	`interests` text NOT NULL,
	`areas` text NOT NULL,
	`message` text NOT NULL,
	`consent_version` text NOT NULL,
	`updates_opt_in` integer NOT NULL,
	`status` text DEFAULT 'received' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `student_applications` (
	`request_id` text PRIMARY KEY NOT NULL,
	`receipt` text NOT NULL,
	`created_at` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`school` text NOT NULL,
	`school_type` text NOT NULL,
	`grade` text NOT NULL,
	`experience` text NOT NULL,
	`age_group` text NOT NULL,
	`guardian_consent` integer NOT NULL,
	`areas` text NOT NULL,
	`message` text NOT NULL,
	`consent_version` text NOT NULL,
	`updates_opt_in` integer NOT NULL,
	`status` text DEFAULT 'received' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submission_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_submission_limits_expiry` ON `submission_limits` (`expires_at`);