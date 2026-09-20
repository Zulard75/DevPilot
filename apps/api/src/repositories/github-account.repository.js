import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { githubAccounts } from "../db/schema/github-accounts.js";

export const createGithubAccount = async ({
  userId,
  githubId,
  accessToken
}) => {
  const [account] = await db
    .insert(githubAccounts)
    .values({
      userId,
      githubId,
      accessToken
    })
    .onConflictDoUpdate({
      target: githubAccounts.githubId,
      set: {
        userId,
        accessToken
      }
    })
    .returning();

  return account;
};



export const findGithubAccountByUserId = async (userId) => {
  const [account] = await db
    .select()
    .from(githubAccounts)
    .where(eq(githubAccounts.userId, userId))
    .limit(1);

  return account;
};