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

export const findUserById = async (id) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(id)))
    .limit(1);

  return result[0] || null;
};

export const findUserByUsername = async (username) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return result[0] || null;
};

export const findOrCreateDevUser = async ({ username = "dev-user", email = "dev@example.com" } = {}) => {
  const devGithubId = "dev-9999";
  let user = await findUserByGithubId(devGithubId);

  if (!user) {
    user = await createUser({
      id: devGithubId,
      login: username,
      name: "Dev Pilot User",
      email,
      avatar_url: "https://avatars.githubusercontent.com/u/9999"
    });
  }

  return user;
};