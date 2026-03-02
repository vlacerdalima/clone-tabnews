test("GET do migrations tem que dar 200", async () => {
  // pego o valor do get do index, dps verifico se deu bom
  const resp = await fetch("http://localhost:3000/api/v1/migrations");
  const corpo = await resp.json();
  expect(Array.isArray(corpo)).toBe(true);
  expect(resp.status).toBe(200);
});
