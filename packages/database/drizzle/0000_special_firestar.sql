CREATE TABLE `domain` (
	`id` integer PRIMARY KEY NOT NULL,
	`domain` text(253) NOT NULL,
	`is_disabled` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text(12) NOT NULL,
	`display_name` text(24) NOT NULL,
	`email` text(256) NOT NULL,
	`firebase_uid` text(36) NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `url` (
	`id` integer PRIMARY KEY NOT NULL,
	`url` text(1024) NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`page_title` text(256),
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_id` integer NOT NULL,
	`domain_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`domain_id`) REFERENCES `domain`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_domains` ON `domain` (`user_id`,`domain`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_firebase_uid` ON `user` (`firebase_uid`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_lower_name` ON `user` (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_lower_email` ON `user` (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX `uq_user_urls` ON `url` (`user_id`,`url`);