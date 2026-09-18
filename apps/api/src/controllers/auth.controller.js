import {
  generateGithubState,
  getGithubAuthUrl,
  exchangeCodeForToken,
  getGithubUser
} from "../services/auth/auth.service.js";

import {
  findUserByGithubId,
  createUser
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
  const { code, state } = req.query;

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