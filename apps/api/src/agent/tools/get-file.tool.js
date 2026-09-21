import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { documents } from "../../db/schema/documents.js";

export const getFileTool = async ({ repositoryId, path }) => {
  const [document] = await db
    .select({
      path: documents.path,
      content: documents.content
    })
    .from(documents)
    .where(
      and(
        eq(documents.repositoryId, repositoryId),
        eq(documents.path, path)
      )
    )
    .limit(1);

  return document || null;
};
