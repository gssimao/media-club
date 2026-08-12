CREATE TABLE `albums` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`cover_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `albums_category_idx` ON `albums` (`category`);--> statement-breakpoint
ALTER TABLE `items` ADD `album_id` text REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE set null;--> statement-breakpoint
CREATE INDEX `items_album_id_idx` ON `items` (`album_id`);
