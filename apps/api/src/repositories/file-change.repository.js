import { and, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { fileChanges } from "../db/schema/file-changes.js";

export const createFileChange = async ({
  userId,
  repositoryId,
  path,
  operation,
  oldContent,
  newContent,
  diff
}) => {
  const [change] = await db
    .insert(fileChanges)
    .values({
      userId,
      repositoryId,
      path,
      operation,
      oldContent,
      newContent,
      diff,
      status: "pending"
    })
    .returning();

  return change;
};

export const findFileChangeById = async (changeId, userId) => {
  const [change] = await db
    .select()
    .from(fileChanges)
    .where(
      and(
        eq(fileChanges.id, changeId),
        eq(fileChanges.userId, userId)
      )
    )
    .limit(1);

  return change;
};

export const updateFileChangeStatus = async (
  changeId,
  userId,
  status
) => {
  const [change] = await db
    .update(fileChanges)
    .set({ status })
    .where(
      and(
        eq(fileChanges.id, changeId),
        eq(fileChanges.userId, userId)
      )
    )
    .returning();

  return change;
};
