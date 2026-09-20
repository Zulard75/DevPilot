import { findGithubAccountByUserId } from "../repositories/github-account.repository.js";
import { getGithubRepositories } from "../services/github/repository.service.js";

export const connectGithub = (_request, response) => response.status(501).json({ error: 'GitHub controller not implemented yet' });

export const getRepositories = async (req, res) => {
	try {
		const account = await findGithubAccountByUserId(req.user.id);

		if (!account) {
			return res.status(404).json({
				message: "GitHub account not found"
			});
		}

		const repositories = await getGithubRepositories(account.accessToken);

		res.json({
			repositories
		});
	} catch (error) {
		console.error(error);

		res.status(500).json({
			message: "Failed to fetch repositories"
		});
	}
};
