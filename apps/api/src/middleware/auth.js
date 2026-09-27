import { findSessionByToken } from "../repositories/session.repository.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : (authHeader || null);

    const sessionToken =
      req.cookies?.session_token ||
      bearerToken ||
      req.headers["x-session-token"];

    if (!sessionToken) {
      return res.status(401).json({
        message: "Authentication required. Provide a session_token cookie or Bearer authorization header."
      });
    }

    const session = await findSessionByToken(sessionToken);

    if (!session) {
      return res.status(401).json({
        message: "Invalid session"
      });
    }

    if (new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({
        message: "Session expired"
      });
    }

    req.user = {
      id: session.userId
    };

    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Authentication failed"
    });
  }
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : (authHeader || null);

    const sessionToken =
      req.cookies?.session_token ||
      bearerToken ||
      req.headers["x-session-token"];

    if (!sessionToken) {
      return next();
    }

    const session = await findSessionByToken(sessionToken);

    if (session && new Date(session.expiresAt) >= new Date()) {
      req.user = {
        id: session.userId
      };
    }

    next();
  } catch {
    next();
  }
};