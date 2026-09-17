# Architecture

DevPilot is organized as a JS monorepo. The React web app communicates with the Express API running on Node.js. The API coordinates PostgreSQL/pgvector persistence, Redis/BullMQ background work, S3-compatible object storage, and LLM/embedding providers. Human approval will sit at the boundary of agent tool execution.
