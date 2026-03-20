import { runner } from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

export default async function aux(request, response) {
  const allowedMethods = ["GET", "POST"];

  if (!allowedMethods.includes(request.method)) {
    return response
      .status(405)
      .json({ error: `método "${request.method} nao permitido"` });
  }
  let client;
  try {
    client = await database.getNewClient();
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
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    if (client) await client.end();
  }
}
