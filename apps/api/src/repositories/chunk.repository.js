import { db } from "../db/index.js";
import { chunks } from "../db/schema/chunks.js";

export const createChunk = async (documentId, content, chunkIndex) => {
  const [chunk] = await db
    .insert(chunks)
    .values({
      documentId,
      content,
      chunkIndex
    })
    .returning();

  return chunk;
};
