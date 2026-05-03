import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
/* 

const createdUser = await orchestrator.createUser();
    await orchestrator.activateUser(createdUser);
    const privilegedUser = await user.addFeatures(createdUser.id, [
      "read:database",
    ]);
    const sessionObject = await orchestrator.createSession(privilegedUser.id);

*/

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.limpa();
  await orchestrator.runPendingMigrations();
});
describe("Anonymous User", () => {
  test("GET do status tem que dar 200", async () => {
    // pego o valor do get do index, dps verifico se deu bom
    const resp = await fetch("http://localhost:3000/api/v1/status");

    expect(resp.status).toBe(200);
    const corpo = await resp.json();
    const horaAgr = new Date(corpo.data_agr).toISOString();
    // console.log(corpo);
    expect(corpo.data_agr).toEqual(horaAgr);
    expect(corpo.psql_version).toBe(undefined);
    expect(corpo.conexoes_maximas).toBe(100);
    expect(corpo.conexoes_agora).toBe(1);
  });
});

describe("Default User", () => {
  test("GET do status tem que dar 200", async () => {
    // pego o valor do get do index, dps verifico se deu bom

    const createdUser = await orchestrator.createUser();
    await orchestrator.activateUser(createdUser);

    const sessionObject = await orchestrator.createSession(createdUser.id);
    const resp = await fetch("http://localhost:3000/api/v1/status", {
      headers: {
        Cookie: `session_id=${sessionObject.token}`,
      },
    });

    expect(resp.status).toBe(200);
    const corpo = await resp.json();
    const horaAgr = new Date(corpo.data_agr).toISOString();
    // console.log(corpo);
    expect(corpo.data_agr).toEqual(horaAgr);
    expect(corpo.psql_version).toBe(undefined);
    expect(corpo.conexoes_maximas).toBe(100);
    expect(corpo.conexoes_agora).toBe(1);
  });
});

describe("Privileged User", () => {
  test("GET do status tem que dar 200", async () => {
    // pego o valor do get do index, dps verifico se deu bom
    const createdUser = await orchestrator.createUser();
    await orchestrator.activateUser(createdUser);
    const privilegedUser = await user.addFeatures(createdUser.id, [
      "read:database",
    ]);
    const sessionObject = await orchestrator.createSession(privilegedUser.id);
    const resp = await fetch("http://localhost:3000/api/v1/status", {
      headers: {
        Cookie: `session_id=${sessionObject.token}`,
      },
    });

    expect(resp.status).toBe(200);
    const corpo = await resp.json();
    const horaAgr = new Date(corpo.data_agr).toISOString();
    // console.log(corpo);
    expect(corpo.data_agr).toEqual(horaAgr);
    expect(corpo.psql_version).toBe("16.11");
    expect(corpo.conexoes_maximas).toBe(100);
    expect(corpo.conexoes_agora).toBe(1);
  });
});
