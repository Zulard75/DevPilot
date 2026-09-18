import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp
} from "drizzle-orm/pg-core";

import { repositories } from "./repositories.js";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),

  repositoryId: integer("repository_id")
    .notNull()
    .references(() => repositories.id, {
      onDelete: "cascade"
    }),

  path: varchar("path", {
    length: 500
  }).notNull(),

  content: text("content").notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull()
});