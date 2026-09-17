import express from "express";

import {
  githubLogin,
  githubCallback
} from "../../controllers/auth.controller.js";

export const authRouter = express.Router();

authRouter.get("/github", githubLogin);

authRouter.get("/github/callback", githubCallback);

export default authRouter;