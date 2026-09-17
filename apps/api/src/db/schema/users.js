import {
  pgTable,
  serial,
  varchar,
  timestamp
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  githubId: varchar("github_id", {
    length: 50
  }).notNull().unique(),

  username: varchar("username", {
    length: 100
  }).notNull(),

  name: varchar("name", {
    length: 255
  }),

  email: varchar("email", {
    length: 255
  }),

  avatarUrl: varchar("avatar_url", {
    length: 500
  }),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
});