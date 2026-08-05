CREATE TABLE `admin_user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_user_username_unique` ON `admin_user` (`username`);--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`list_type` text NOT NULL,
	`external_id` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`year` integer,
	`cover_url` text,
	`metadata` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `items_category_external_list_idx` ON `items` (`category`,`external_id`,`list_type`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `admin_user`(`id`) ON UPDATE no action ON DELETE cascade
);
