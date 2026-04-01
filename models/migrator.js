import { runner } from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

async function listPendingMigrations() {
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

    const pendingMigrations = await runner(defaultMigration);
    return pendingMigrations;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    if (client) await client.end();
  }
}

async function runPendingMigrations() {
  let client;
  try {
    client = await database.getNewClient();
    const defaultMigration = {
      dbClient: client,

      dryRun: true,
      dir: join("infra", "migrations"),
      direction: "up",
      logger: () => {},
      verbose: false,
      migrationsTable: "pgmigrations",
    };

    const migratedMigrations = await runner({
      ...defaultMigration,
      dryRun: false,
    });
    return migratedMigrations;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    if (client) await client.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
