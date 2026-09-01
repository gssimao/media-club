CREATE TABLE `show_tracker_items` (
	`id` text PRIMARY KEY NOT NULL,
	`external_id` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`year` integer,
	`cover_url` text,
	`metadata` text,
	`notes` text,
	`track_status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `show_tracker_items_external_idx` ON `show_tracker_items` (`external_id`);