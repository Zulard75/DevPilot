CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY,
	"github_id" varchar(50) NOT NULL UNIQUE,
	"username" varchar(100) NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"avatar_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
