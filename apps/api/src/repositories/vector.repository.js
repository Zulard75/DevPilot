import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { embeddings } from "../db/schema/embeddings.js";
import { chunks } from "../db/schema/chunks.js";
import { documents } from "../db/schema/documents.js";

export const searchSimilarChunks = async (
  embedding,
  repositoryId,
  limit = 5
) => {
  const vector = `[${embedding.join(",")}]`;

  const result = await db.execute(sql`
    SELECT
      ${chunks.id} AS chunk_id,
      ${chunks.content} AS content,
      ${documents.path} AS path,
      1 - (${embeddings.embedding} <=> ${vector}::vector) AS similarity
    FROM ${embeddings}
    INNER JOIN ${chunks}
      ON ${embeddings.chunkId} = ${chunks.id}
    INNER JOIN ${documents}
      ON ${chunks.documentId} = ${documents.id}
    WHERE ${documents.repositoryId} = ${repositoryId}
    ORDER BY ${embeddings.embedding} <=> ${vector}::vector
    LIMIT ${limit}
  `);

  return result.rows;
};
