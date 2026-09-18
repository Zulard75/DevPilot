import {
  pgTable,
  serial,
  integer,
  text,
  timestamp
} from "drizzle-orm/pg-core";

import { documents } from "./documents.js";

export const chunks = pgTable("chunks", {
  id: serial("id").primaryKey(),

  documentId: integer("document_id")
    .notNull()
    .references(() => documents.id, {
      onDelete: "cascade"
    }),

  content: text("content").notNull(),

  chunkIndex: integer("chunk_index").notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull()
});