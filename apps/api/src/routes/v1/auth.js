import express from "express";

import {
  githubLogin,
  githubCallback
} from "../../controllers/auth.controller.js";
import { requireAuth } from "../../middleware/auth.js";

export const authRouter = express.Router();

authRouter.get("/github", githubLogin);

authRouter.get("/github/callback", githubCallback);

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({
    message: "Authenticated",
    userId: req.user.id
  });
});

export default authRouter;