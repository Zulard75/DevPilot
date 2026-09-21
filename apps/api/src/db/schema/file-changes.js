import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { repositories } from "./repositories.js";

export const fileChanges = pgTable("file_changes", {
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

  path: varchar("path", {
    length: 500
  }).notNull(),

  operation: varchar("operation", {
    length: 50
  }).notNull(),

  oldContent: text("old_content"),

  newContent: text("new_content"),
  
  diff: text("diff"),

  status: varchar("status", {
    length: 50
  }).notNull().default("pending"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull()
});
