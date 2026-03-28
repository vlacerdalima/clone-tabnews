import { runner } from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";
import { createRouter } from "next-connect";
import { MethodNotAllowedError } from "infra/errors";

const router = createRouter();

router.get(GetHandler);
router.post(PostHandler);
export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});
function onNoMatchHandler(request, response) {
  const erroPublico = new MethodNotAllowedError();
  response.status(405).json(erroPublico);
}
function onErrorHandler(error) {
  console.error(error);
  throw error;
}
async function GetHandler(request, response) {
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
    return response.status(200).json(pendingMigrations);
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    if (client) await client.end();
  }
}

async function PostHandler(request, response) {
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

    const migratedMigrations = await runner({
      ...defaultMigration,
      dryRun: false,
    });
    if (migratedMigrations.length > 0)
      return response.status(201).json(migratedMigrations);
    return response.status(200).json(migratedMigrations);
  } finally {
    if (client) await client.end();
  }
}
