import { Ollama } from "ollama";

export const ollama = new Ollama({
	host: "https://ollama.com",
	headers: {
		Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`
	}
});

export const askOllama = async (prompt) => {
	const response = await ollama.chat({
		model: "gpt-oss:120b",
		messages: [
			{
				role: "user",
				content: prompt
			}
		]
	});

	return response.message.content;
};
