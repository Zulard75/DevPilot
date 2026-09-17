import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade"
    }),

  sessionToken: varchar("session_token", {
    length: 255
  }).notNull().unique(),

  expiresAt: timestamp("expires_at").notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull()
});