CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`userName` text NOT NULL,
	`displayName` text NOT NULL,
	`email` text NOT NULL,
	`firebaseUid` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`hasDeleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
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
CREATE UNIQUE INDEX `userName` ON `users` (`userName`);--> statement-breakpoint
CREATE UNIQUE INDEX `emailIdx` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `firebaseUidIdx` ON `users` (`firebaseUid`);--> statement-breakpoint
CREATE UNIQUE INDEX `urlIdx` ON `urls` (`userId`,`url`);