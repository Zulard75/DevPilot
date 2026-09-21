import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { documents } from "../../db/schema/documents.js";

export const listFilesTool = async ({ repositoryId }) => {
  return db
    .select({
      id: documents.id,
      path: documents.path
    })
    .from(documents)
    .where(eq(documents.repositoryId, repositoryId));
};
