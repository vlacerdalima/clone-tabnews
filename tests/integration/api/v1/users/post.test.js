import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.limpa();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const resp = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "vitorlacerda",
          email: "vlacerdalima@gmail.com",
          password: "teste123",
        }),
      });

      expect(resp.status).toBe(201);

      const corpo = await resp.json();
      expect(corpo).toEqual({
        id: corpo.id,
        username: "vitorlacerda",
        email: "vlacerdalima@gmail.com",
        password: "teste123",
        created_at: corpo.created_at,
        updated_at: corpo.updated_at,
      });

      expect(uuidVersion(corpo.id)).toBe(4);
      expect(Date.parse(corpo.created_at)).not.toBe(NaN);
      expect(Date.parse(corpo.updated_at)).not.toBe(NaN);
    });

    test("With duplicated `email`", async () => {
      const resp1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado1",
          email: "duplicado@gmail.com",
          password: "teste123",
        }),
      });

      expect(resp1.status).toBe(201);

      const resp2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado2",
          email: "Duplicado@gmail.com",
          password: "teste123",
        }),
      });

      expect(resp2.status).toBe(400);
      const corpo2 = await resp2.json();
      expect(corpo2).toEqual({
        name: "ValidationError",
        message: "O email informado já existe",
        action: "Utilize outro email",
        status_code: 400,
      });
    });

    test("With duplicated `username`", async () => {
      const resp1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameduplicado1",
          email: "random@gmail.com",
          password: "teste123",
        }),
      });

      expect(resp1.status).toBe(201);

      const resp2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Usernameduplicado1",
          email: "aleatorio@gmail.com",
          password: "teste123",
        }),
      });

      expect(resp2.status).toBe(400);
      const corpo2 = await resp2.json();
      expect(corpo2).toEqual({
        name: "ValidationError",
        message: "O username informado já existe",
        action: "Utilize outro username",
        status_code: 400,
      });
    });
  });
});
