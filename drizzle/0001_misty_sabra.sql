CREATE TABLE `family_list_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`checked` boolean NOT NULL DEFAULT false,
	`updatedBy` varchar(80) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_list_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_lists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inviteCode` varchar(64) NOT NULL,
	`title` varchar(120) NOT NULL,
	`ownerName` varchar(80) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_lists_id` PRIMARY KEY(`id`),
	CONSTRAINT `family_lists_inviteCode_unique` UNIQUE(`inviteCode`)
);
