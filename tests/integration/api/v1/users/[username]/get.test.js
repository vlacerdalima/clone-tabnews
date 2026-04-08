import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.limpa();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      await orchestrator.createUser({
        username: "MesmoCase",
        email: "mesmo.case@gmail.com",
        password: "teste123",
      });

      const resp2 = await fetch("http://localhost:3000/api/v1/users/MesmoCase");

      expect(resp2.status).toBe(200);
      const corpo = await resp2.json();
      expect(corpo).toEqual({
        id: corpo.id,
        username: "MesmoCase",
        email: "mesmo.case@gmail.com",
        password: corpo.password,
        created_at: corpo.created_at,
        updated_at: corpo.updated_at,
      });

      expect(uuidVersion(corpo.id)).toBe(4);
      expect(Date.parse(corpo.created_at)).not.toBe(NaN);
      expect(Date.parse(corpo.updated_at)).not.toBe(NaN);
    });

    test("With exact case mismatch", async () => {
      await orchestrator.createUser({
        username: "casediferente",
        email: "case.diferente@gmail.com",
        password: "teste123",
      });

      const resp2 = await fetch(
        "http://localhost:3000/api/v1/users/CaseDiferente",
      );

      expect(resp2.status).toBe(200);
      const corpo = await resp2.json();
      expect(corpo).toEqual({
        id: corpo.id,
        username: "casediferente",
        email: "case.diferente@gmail.com",
        password: corpo.password,
        created_at: corpo.created_at,
        updated_at: corpo.updated_at,
      });

      expect(uuidVersion(corpo.id)).toBe(4);
      expect(Date.parse(corpo.created_at)).not.toBe(NaN);
      expect(Date.parse(corpo.updated_at)).not.toBe(NaN);
    });

    test("With nonexistant username", async () => {
      const resp = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
      );

      expect(resp.status).toBe(404);
      const corpo = await resp.json();
      expect(corpo).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema",
        action: "Verifique se o username está digitado corretamente",
        status_code: 404,
      });
    });
  });
});
