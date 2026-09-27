import { findUserById } from "../repositories/user.repository.js";
import { findGithubAccountByUserId } from "../repositories/github-account.repository.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const githubAccount = await findGithubAccountByUserId(req.user.id);

    res.json({
      user: {
        ...user,
        hasGithubLinked: !!githubAccount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
