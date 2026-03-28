import database from "infra/database.js";

import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeAll(limpa);
async function limpa() {
  await database.query("drop schema public cascade; create schema public;");
}

test("PUT do migrations tem que dar 405", async () => {
  // pego o valor do get do index, dps verifico se deu bom
  const resp = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "PUT",
  });
  expect(resp.status).toBe(405);
});
