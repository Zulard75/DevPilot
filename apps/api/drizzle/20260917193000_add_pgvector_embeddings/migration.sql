CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS "repositories" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"github_id" integer NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"full_name" varchar(500) NOT NULL,
	"url" text,
	"default_branch" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "documents" (
	"id" serial PRIMARY KEY,
	"repository_id" integer NOT NULL REFERENCES "repositories"("id") ON DELETE CASCADE,
	"path" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "chunks" (
	"id" serial PRIMARY KEY,
	"document_id" integer NOT NULL REFERENCES "documents"("id") ON DELETE CASCADE,
	"content" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "embeddings" (
	"id" serial PRIMARY KEY,
	"chunk_id" integer NOT NULL REFERENCES "chunks"("id") ON DELETE CASCADE,
	"embedding" vector(384) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "github_accounts" (
	"id" serial PRIMARY KEY,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"github_id" varchar(50) NOT NULL UNIQUE,
	"access_token" varchar(500) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);