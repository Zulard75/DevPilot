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
