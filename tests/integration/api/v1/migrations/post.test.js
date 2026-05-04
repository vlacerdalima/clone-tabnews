import user from "models/user";
import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.limpa();
  await orchestrator.runPendingMigrations();
});

describe("Privileged User", () => {
  test("testa se todas as migrations rodaram", async () => {
    // pego o valor do get do index, dps verifico se deu bom
    const createdUser = await orchestrator.createUser();
    await orchestrator.activateUser(createdUser);
    const privilegedUser = await user.addFeatures(createdUser.id, [
      "read:database",
    ]);
    const sessionObject = await orchestrator.createSession(privilegedUser.id);
    const resp = await fetch("http://localhost:3000/api/v1/migrations", {
      method: "POST",
      headers: {
        Cookie: `session_id=${sessionObject.token}`,
      },
    });
    const corpo = await resp.json();
    expect(Array.isArray(corpo)).toBe(true);
    expect(corpo.length).toBe(0);
    expect(resp.status).toBe(200);
  });
});

describe("Anonymous or Default User", () => {
  test("POST to api/v1/migrations should return 403", async () => {
    const createdUser = await orchestrator.createUser();
    await orchestrator.activateUser(createdUser);

    const sessionObject = await orchestrator.createSession(createdUser.id);
    const resp = await fetch("http://localhost:3000/api/v1/migrations", {
      method: "POST",
      headers: {
        Cookie: `session_id=${sessionObject.token}`,
      },
    });
    expect(resp.status).toBe(403);
  });
});
