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

export const findDocumentById = async (documentId) => {
	const [document] = await db
		.select()
		.from(documents)
		.where(eq(documents.id, Number(documentId)))
		.limit(1);

	return document || null;
};

export const listDocumentsByRepository = async (repositoryId) => {
	return db
		.select({
			id: documents.id,
			repositoryId: documents.repositoryId,
			path: documents.path,
			createdAt: documents.createdAt
		})
		.from(documents)
		.where(eq(documents.repositoryId, Number(repositoryId)));
};

export const listAllDocuments = async (limit = 100) => {
	return db
		.select({
			id: documents.id,
			repositoryId: documents.repositoryId,
			path: documents.path,
			createdAt: documents.createdAt
		})
		.from(documents)
		.limit(limit);
};
