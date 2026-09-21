import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const repositories = pgTable("repositories", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade"
    }),

  githubId: integer("github_id").notNull().unique(),

  name: varchar("name", {
    length: 255
  }).notNull(),

  fullName: varchar("full_name", {
    length: 500
  }).notNull(),

  url: text("url"),

  defaultBranch: varchar("default_branch", {
    length: 255
  }),

  localPath: text("local_path"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull()
});