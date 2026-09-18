import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const githubAccounts = pgTable("github_accounts", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade"
    }),

  githubId: varchar("github_id", {
    length: 50
  }).notNull().unique(),

  accessToken: varchar("access_token", {
    length: 500
  }).notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull()
});