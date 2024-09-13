CREATE TABLE `user` (
	`id` integer PRIMARY KEY NOT NULL,
	`userName` text NOT NULL,
	`email` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
