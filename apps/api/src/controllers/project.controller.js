import {
  listRepositoriesByUser,
  listAllRepositories,
  findRepositoryById
} from "../repositories/repository.repository.js";

export const listProjects = async (req, res) => {
  try {
    const userId = req.user?.id;
    let projects = userId
      ? await listRepositoriesByUser(userId)
      : [];

    if (!projects || projects.length === 0) {
      projects = await listAllRepositories();
    }

    res.json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to list projects" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await findRepositoryById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch project" });
  }
};