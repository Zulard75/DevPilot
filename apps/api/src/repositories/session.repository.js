import { eq } from "drizzle-orm";
import crypto from "crypto";

import { db } from "../db/index.js";
import { sessions } from "../db/schema/sessions.js";

export const createSession = async (userId) => {
  const sessionToken = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const [session] = await db
    .insert(sessions)
    .values({
      userId,
      sessionToken,
      expiresAt
    })
    .returning();

  return session;
};

export const findSessionByToken = async (sessionToken) => {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.sessionToken, sessionToken))
    .limit(1);

  return session;
};
