import { createEmbedding } from "../../ai/embeddings/huggingface.js";
import { searchSimilarChunks } from "../../repositories/vector.repository.js";

export const searchCode = async (query, repositoryId, limit = 5) => {
  const embedding = await createEmbedding(query);

  return searchSimilarChunks(embedding, repositoryId, limit);
};
