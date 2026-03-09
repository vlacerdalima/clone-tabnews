import runner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function aux(request, response) {
  const client = await database.getNewClient();
  const defaultMigration = {
    dbClient: client,

    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
  if (request.method === "GET") {
    const pendingMigrations = await runner(defaultMigration);
    await client.end();
    return response.status(200).json(pendingMigrations);
  }
  if (request.method === "POST") {
    const migratedMigrations = await runner({
      ...defaultMigration,
      dryRun: false,
    });
    await client.end();
    if (migratedMigrations.length > 0)
      return response.status(201).json(migratedMigrations);
    return response.status(200).json(migratedMigrations);
  }
  console.log("testando bug para status 405");
  async function processar() {
    for (let i = 0; i < 10; i++) {
      const client = await database.getNewClient();
      console.log("novo cliente");
    }
  }

  return response.status(405).end();
}
