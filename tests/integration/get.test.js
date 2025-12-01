test("GET do status tem que dar 200", async () => {
  // pego o valor do get do index, dps verifico se deu bom
  const resp = await fetch("http://localhost:3000/api/v1/status");
  expect(resp.status).toBe(200);
});
