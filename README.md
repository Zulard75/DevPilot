# DevPilot

A cloud-deployed AI developer assistant built as a TypeScript monorepo.

## Structure

- `apps/web`: React + Vite frontend
- `apps/api`: Express REST API, split into server, config, routes, controllers, middleware, services, and utilities
- `apps/worker`: background jobs and queue consumers
- `apps/api/src/db`: PostgreSQL connection, schemas, and migrations
- `packages/ai`: embeddings, RAG, prompting, and agent integrations
- `packages/shared`: shared contracts and types
- `packages/config`: shared environment configuration
- `infra/docker`: local PostgreSQL/pgvector, Redis, and storage services
- `infra/deployment`: cloud deployment definitions
- `docs`: architecture and delivery notes

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

## Run with Docker

Requirements: Docker Desktop with Docker Compose.

```bash
cp .env.example .env
# Set HF_TOKEN in .env for the embedding endpoint.
docker compose -f infra/docker/docker-compose.yml up -d --build
docker compose -f infra/docker/docker-compose.yml ps
```

The Postgres service uses `pgvector/pgvector:pg17`. On a fresh Docker volume,
the migration in `apps/api/drizzle` automatically enables the `vector`
extension and creates `embeddings.embedding` as `vector(384)`. To apply the
same setup to an existing database, run:

```bash
docker compose -f infra/docker/docker-compose.yml exec -T postgres \
	psql -U postgres -d devpilot \
	-c 'CREATE EXTENSION IF NOT EXISTS vector;' \
	-c 'CREATE TABLE IF NOT EXISTS embeddings (id serial PRIMARY KEY, text text NOT NULL, embedding vector(384) NOT NULL, created_at timestamp DEFAULT now() NOT NULL);'
```

Calling `GET /api/v1/ai/embedding-test` generates a 384-dimensional embedding
and stores it in PostgreSQL.

The API is available at `http://localhost:4000`, PostgreSQL at `localhost:5432`,
and Redis at `localhost:6379`. Containers communicate over the Compose network
using the service names `postgres` and `redis`.

Stop the stack with:

```bash
docker compose -f infra/docker/docker-compose.yml down
```

Add `-v` to the `down` command only when you also want to delete the PostgreSQL
data volume.

The first slice establishes the project boundaries. Product features will be added incrementally.

The API health check is available at `GET /api/v1/health`.

## MERN backend layout

The backend follows the MERN stack: MongoDB, Express, React, and Node.js.

- `apps/api/src/server.ts`: starts the Node.js server
- `apps/api/src/app.ts`: configures Express
- `apps/api/src/routes`: versioned REST routes
- `apps/api/src/controllers`: HTTP request handlers
- `apps/api/src/services`: application and database-facing services
- `apps/api/src/middleware`: logging, auth, validation, 404, and error handling
- `packages/db/src/client`: MongoDB connection lifecycle
- `packages/db/src/models`: Mongoose models
