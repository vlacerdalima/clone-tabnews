import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

test("POST do status tem que dar 405", async () => {
  // pego o valor do get do index, dps verifico se deu bom
  const resp = await fetch("http://localhost:3000/api/v1/status", {
    method: "POST",
  });
  const corpo = await resp.json();
  console.log(corpo);

  expect(resp.status).toBe(405);
});
