CREATE TABLE `family_pantry_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unit` varchar(16) NOT NULL DEFAULT 'adet',
	`expiresOn` varchar(10),
	`barcode` varchar(64),
	`updatedBy` varchar(80) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_pantry_items_id` PRIMARY KEY(`id`)
);
