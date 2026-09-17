import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";

export const findUserByGithubId = async (githubId) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.githubId, String(githubId)));

  return result[0];
};

export const createUser = async (githubUser) => {
  const result = await db
    .insert(users)
    .values({
      githubId: String(githubUser.id),
      username: githubUser.login,
      name: githubUser.name,
      email: githubUser.email,
      avatarUrl: githubUser.avatar_url
    })
    .returning();

  return result[0];
};