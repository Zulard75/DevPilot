import {
  generateGithubState,
  getGithubAuthUrl,
  exchangeCodeForToken,
  getGithubUser
} from "../services/auth/auth.service.js";

import {
  findUserByGithubId,
  findUserById,
  findUserByUsername,
  createUser,
  findOrCreateDevUser
} from "../repositories/user.repository.js";
import { createGithubAccount } from "../repositories/github-account.repository.js";
import { createSession } from "../repositories/session.repository.js";

export const githubLogin = (req, res) => {
  const state = generateGithubState();

  res.cookie("github_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 10 * 60 * 1000
  });

  const url = getGithubAuthUrl(state);

  console.log("GITHUB AUTH URL:", url);

  res.redirect(url);
};



export const githubCallback = async (req, res) => {
  const { code, state, error, error_description: errorDescription } = req.query;

  if (error) {
    return res.status(400).json({
      message: errorDescription || `GitHub authorization failed: ${error}`
    });
  }

  if (!code || !state) {
    return res.status(400).json({
      message: "Missing code or state"
    });
  }

  if (state !== req.cookies.github_oauth_state) {
    return res.status(403).json({
      message: "Invalid OAuth state"
    });
  }

  try {
    const tokenData = await exchangeCodeForToken(code);

    const githubUser = await getGithubUser(tokenData.access_token);

    let user = await findUserByGithubId(githubUser.id);

    if (!user) {
      user = await createUser(githubUser);
    }

    await createGithubAccount({
      userId: user.id,
      githubId: String(githubUser.id),
      accessToken: tokenData.access_token
    });

    const session = await createSession(user.id);

    res.cookie("session_token", session.sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: "GitHub authentication successful",
      user
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "GitHub authentication failed"
    });
  }
};

export const devLogin = async (req, res) => {
  try {
    const { username, userId, email = "dev@example.com" } = req.body || {};
    let user;

    if (userId) {
      user = await findUserById(Number(userId));
    } else if (username) {
      user = await findUserByUsername(username);
    }

    if (!user) {
      user = await findOrCreateDevUser({ username: username || "Zulard75", email });
    }

    const session = await createSession(user.id);

    res.cookie("session_token", session.sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Development authentication successful",
      sessionToken: session.sessionToken,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Development login failed",
      error: error.message
    });
  }
};

export const logout = async (_req, res) => {
  res.clearCookie("session_token");
  res.json({ message: "Logged out successfully" });
};