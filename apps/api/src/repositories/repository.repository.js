import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { repositories } from "../db/schema/repositories.js";

export const createRepository = async (userId, githubRepository) => {
  const [repository] = await db
    .insert(repositories)
    .values({
      userId,
      githubId: githubRepository.id,
      name: githubRepository.name,
      fullName: githubRepository.full_name,
      url: githubRepository.html_url,
      defaultBranch: githubRepository.default_branch
    })
    .onConflictDoUpdate({
      target: repositories.githubId,
      set: {
        userId,
        name: githubRepository.name,
        fullName: githubRepository.full_name,
        url: githubRepository.html_url,
        defaultBranch: githubRepository.default_branch
      }
    })
    .returning();

  return repository;
};

export const findRepositoryById = async (repositoryId) => {
  const [repository] = await db
    .select()
    .from(repositories)
    .where(eq(repositories.id, repositoryId))
    .limit(1);

  return repository;
};

export const findRepositoryByUser = async (repositoryId, userId) => {
  const [repository] = await db
    .select()
    .from(repositories)
    .where(
      and(
        eq(repositories.id, repositoryId),
        eq(repositories.userId, userId)
      )
    )
    .limit(1);

  return repository;
};

export const updateRepositoryPath = async (repositoryId, localPath) => {
  const [repository] = await db
    .update(repositories)
    .set({ localPath })
    .where(eq(repositories.id, repositoryId))
    .returning();

  return repository;
};