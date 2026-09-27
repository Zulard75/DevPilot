import {
  listRepositoriesByUser,
  listAllRepositories,
  findRepositoryById,
  createProject,
  deleteProject
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

export const createProjectController = async (req, res) => {
  try {
    const { name, fullName, url, defaultBranch = "main" } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const userId = req.user?.id || 2; // fallback to default user in dev

    const project = await createProject({
      userId,
      name,
      fullName: fullName || name,
      url,
      defaultBranch
    });

    res.status(201).json({
      message: "Project created successfully",
      project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create project",
      error: error.message
    });
  }
};

export const deleteProjectController = async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isInteger(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const deleted = await deleteProject(projectId, req.user?.id);

    if (!deleted) {
      return res.status(404).json({ message: "Project not found or not authorized" });
    }

    res.json({
      message: "Project deleted successfully",
      deleted
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete project" });
  }
};