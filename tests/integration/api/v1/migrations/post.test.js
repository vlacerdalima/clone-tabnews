import database from "infra/database.js";

import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

beforeAll(limpa);
async function limpa() {
  await database.query("drop schema public cascade; create schema public;");
}

test("POST do migrations tem que dar 200,além de ter migrations", async () => {
  // pego o valor do get do index, dps verifico se deu bom

  const resp = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  const corpo = await resp.json();
  expect(Array.isArray(corpo)).toBe(true);
  expect(corpo.length).toBeGreaterThan(0);
  console.log(corpo);
  expect(resp.status).toBe(201);
});

test("testa se todas as migrations rodaram", async () => {
  // pego o valor do get do index, dps verifico se deu bom

  const resp = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  const corpo = await resp.json();
  expect(Array.isArray(corpo)).toBe(true);
  expect(corpo.length).toBe(0);
  expect(resp.status).toBe(200);
});
