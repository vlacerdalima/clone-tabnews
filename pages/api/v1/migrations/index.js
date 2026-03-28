import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator.js";
const router = createRouter();

router.get(GetHandler);
router.post(PostHandler);
export default router.handler(controller.errorHandlers);

async function GetHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pendingMigrations);
}

async function PostHandler(request, response) {
  const migratedMigrations = await migrator.runPendingMigrations();

  if (migratedMigrations.length > 0)
    return response.status(201).json(migratedMigrations);
  return response.status(200).json(migratedMigrations);
}
