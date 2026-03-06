import runner from "node-pg-migrate";
import { join } from "node:path";
const defaultMigration = {
  databaseUrl: process.env.DATABASE_URL,
  dryRun: true,
  dir: join("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};
export default async function aux(request, response) {
  if (request.method === "GET") {
    const pendingMigrations = await runner(defaultMigration);

    return response.status(200).json(pendingMigrations);
  }
  if (request.method === "POST") {
    const migratedMigrations = await runner({
      ...defaultMigration,
      dryRun: false,
    });
    if (migratedMigrations.length > 0)
      return response.status(201).json(migratedMigrations);
    return response.status(200).json(migratedMigrations);
  }
  return response.status(405).end();
}
