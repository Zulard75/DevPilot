import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { documents } from "../db/schema/documents.js";

export const createDocument = async (repositoryId, path, content) => {
	const [document] = await db
		.insert(documents)
		.values({
			repositoryId,
			path,
			content
		})
		.returning();

	return document;
};
 
export const findDocument = async (repositoryId, path) => {
	const [document] = await db
		.select()
		.from(documents)
		.where(
			and(
				eq(documents.repositoryId, repositoryId),
				eq(documents.path, path)
			)
		)
		.limit(1);

	return document;
};

export const updateDocument = async (documentId, content) => {
	const [document] = await db
		.update(documents)
		.set({ content })
		.where(eq(documents.id, documentId))
		.returning();

	return document;
};
