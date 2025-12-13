test("GET do status tem que dar 200", async () => {
  // pego o valor do get do index, dps verifico se deu bom
  const resp = await fetch("http://localhost:3000/api/v1/status");
  expect(resp.status).toBe(200);
  const corpo = await resp.json();
  console.log(corpo);
  expect(corpo.data_agr).toBeDefined();
  expect(corpo.psql_version).toBe("16.11");
  expect(corpo.conexoes_maximas).toBe(100);
  expect(corpo.conexos_agora).toBe(1);
});
