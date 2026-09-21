import {
	pgTable,
	serial,
	integer,
	text,
	varchar,
	timestamp
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { repositories } from "./repositories.js";

export const agentRuns = pgTable("agent_runs", {
	id: serial("id").primaryKey(),

	userId: integer("user_id")
		.notNull()
		.references(() => users.id, {
			onDelete: "cascade"
		}),

	repositoryId: integer("repository_id")
		.notNull()
		.references(() => repositories.id, {
			onDelete: "cascade"
		}),

	task: text("task").notNull(),

	status: varchar("status", {
		length: 50
	}).notNull().default("running"),

	plan: text("plan"),

	result: text("result"),

	error: text("error"),

	createdAt: timestamp("created_at")
		.defaultNow()
		.notNull(),

	completedAt: timestamp("completed_at")
});
