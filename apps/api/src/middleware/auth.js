import { findSessionByToken } from "../repositories/session.repository.js";

export const requireAuth = async (req, res, next) => {
  try {
    const sessionToken = req.cookies.session_token;

    if (!sessionToken) {
      return res.status(401).json({
        message: "Authentication required"
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