CREATE TABLE `streaming_list_items` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`external_id` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`year` integer,
	`cover_url` text,
	`metadata` text,
	`watched_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `streaming_lists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `streaming_list_items_list_external_idx` ON `streaming_list_items` (`list_id`,`external_id`);--> statement-breakpoint
CREATE INDEX `streaming_list_items_list_id_idx` ON `streaming_list_items` (`list_id`);--> statement-breakpoint
CREATE TABLE `streaming_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`cover_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
