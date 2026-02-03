// Prisma Configuration File
// This file configures Prisma behavior for this project.
// Note: defineConfig is available in Prisma 5.1+ via @prisma/config

import "dotenv/config";

// Export configuration object directly (no defineConfig required)
const config = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
};

export default config;

