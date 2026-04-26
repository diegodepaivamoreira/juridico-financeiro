CREATE TABLE `aReceber` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cliente` varchar(255) NOT NULL,
	`reu` varchar(255) NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`valor` int,
	`status` enum('Pendente','Recebido') NOT NULL DEFAULT 'Pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aReceber_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lancamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`data` varchar(10) NOT NULL,
	`cliente` varchar(255) NOT NULL,
	`reu` varchar(255) NOT NULL,
	`processo` varchar(255),
	`tipo` varchar(50) NOT NULL,
	`valor` int NOT NULL,
	`banco` varchar(50) NOT NULL,
	`mes` int NOT NULL,
	`ano` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lancamentos_id` PRIMARY KEY(`id`)
);
