import { db } from "../db/index.js";
import { embeddings } from "../db/schema/embeddings.js";

export const createEmbedding = async (chunkId, embedding) => {
  const [result] = await db
    .insert(embeddings)
    .values({
      chunkId,
      embedding
    })
    .returning();

  return result;
};
