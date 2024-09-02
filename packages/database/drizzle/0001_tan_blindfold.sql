CREATE TABLE `urls` (
	`id` integer PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`pageTitle` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`userId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `urlIdx` ON `urls` (`userId`,`url`);