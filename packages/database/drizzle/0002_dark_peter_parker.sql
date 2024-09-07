ALTER TABLE `users` ADD `name` text DEFAULT 'ToyB0x' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `name` ON `users` (`name`);