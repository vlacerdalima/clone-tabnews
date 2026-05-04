import user from "models/user";

import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.limpa();
  await orchestrator.runPendingMigrations();
});

describe("Privileged User", () => {
  test("GET do migrations tem que dar 200", async () => {
    // pego o valor do get do index, dps verifico se deu bom

    const createdUser = await orchestrator.createUser();
    await orchestrator.activateUser(createdUser);
    const privilegedUser = await user.addFeatures(createdUser.id, [
      "read:database",
    ]);
    const sessionObject = await orchestrator.createSession(privilegedUser.id);
    const resp = await fetch("http://localhost:3000/api/v1/migrations", {
      headers: {
        Cookie: `session_id=${sessionObject.token}`,
      },
    });
    const corpo = await resp.json();
    expect(Array.isArray(corpo)).toBe(true);
    expect(resp.status).toBe(200);
  });
});

describe("Anonymous or Default User", () => {
  test("GET do migrations tem que dar 403", async () => {
    // pego o valor do get do index, dps verifico se deu bom
    const resp = await fetch("http://localhost:3000/api/v1/migrations");
    const corpo = await resp.json();
    expect(resp.status).toBe(403);
  });
});
