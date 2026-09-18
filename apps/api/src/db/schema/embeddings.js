import {
  customType,
  pgTable,
  serial,
  integer,
  timestamp
} from "drizzle-orm/pg-core";

import { chunks } from "./chunks.js";

const vector = customType({
  dataType(config) {
    return `vector(${config?.dimensions ?? 384})`;
  },

  toDriver(value) {
    return `[${value.join(",")}]`;
  },

  fromDriver(value) {
    return value.slice(1, -1).split(",").map(Number);
  }
});

export const embeddings = pgTable("embeddings", {
  id: serial("id").primaryKey(),

  chunkId: integer("chunk_id")
    .notNull()
    .references(() => chunks.id, {
      onDelete: "cascade"
    }),

  embedding: vector("embedding", {
    dimensions: 384
  }).notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull()
});

export const embeddingsTable = "embeddings";