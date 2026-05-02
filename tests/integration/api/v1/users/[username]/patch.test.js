import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.limpa();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With unique `username`", async () => {
      await orchestrator.createUser({
        username: "uniqueUser0",
        email: "uniqueUser0@gmail.com",
        password: "teste123",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser0",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(response.status).toBe(403);
      const corpo = await response.json();
      expect(corpo).toEqual({
        action: "Verifique se o seu usuário possui a feature update:user",
        message: "Você não possui permissão para executar esta ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("With nonexistant 'username'", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const resp = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
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

    test("With duplicated `username`", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      const createdUser = await orchestrator.createUser({
        username: "user2",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      expect(response.status).toBe(400);
      const corpo2 = await response.json();
      expect(corpo2).toEqual({
        name: "ValidationError",
        message: "O username informado já existe",
        action: "Utilize outro username",
        status_code: 400,
      });
    });

    test("With duplicated `email`", async () => {
      await orchestrator.createUser({
        email: "user3@gmail.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "user4@gmail.com",
      });

      const activatedUser = await orchestrator.activateUser(createdUser2);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "user3@gmail.com",
          }),
        },
      );

      expect(response.status).toBe(400);
      const corpo2 = await response.json();
      expect(corpo2).toEqual({
        name: "ValidationError",
        message: "O email informado já existe",
        action: "Utilize outro email",
        status_code: 400,
      });
    });

    test("With unique `username`", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueUser1",
        email: "uniqueUser1@gmail.com",
        password: "teste123",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(response.status).toBe(200);
      const corpo = await response.json();
      expect(corpo).toEqual({
        id: corpo.id,
        username: "uniqueUser2",
        email: "uniqueUser1@gmail.com",
        password: corpo.password,
        features: corpo.features,
        created_at: corpo.created_at,
        updated_at: corpo.updated_at,
      });

      expect(uuidVersion(corpo.id)).toBe(4);
      expect(Date.parse(corpo.created_at)).not.toBe(NaN);
      expect(Date.parse(corpo.updated_at)).not.toBe(NaN);
      expect(corpo.updated_at).not.toEqual(corpo.created_at);
    });

    test("With unique `email`", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueEmail1",
        email: "uniqueEmail1@gmail.com",
        password: "teste123",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "uniqueEmail2@gmail.com",
          }),
        },
      );

      expect(response.status).toBe(200);
      const corpo = await response.json();
      expect(corpo).toEqual({
        id: corpo.id,
        username: "uniqueEmail1",
        email: "uniqueEmail2@gmail.com",
        password: corpo.password,
        features: corpo.features,
        created_at: corpo.created_at,
        updated_at: corpo.updated_at,
      });

      expect(uuidVersion(corpo.id)).toBe(4);
      expect(Date.parse(corpo.created_at)).not.toBe(NaN);
      expect(Date.parse(corpo.updated_at)).not.toBe(NaN);
      expect(corpo.updated_at).not.toEqual(corpo.created_at);
    });

    test("With new `password`", async () => {
      const createdUser = await orchestrator.createUser({
        username: "newPassword1",
        email: "newPassword1@gmail.com",
        password: "newPassword1",
      });

      const activatedUser = await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(activatedUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/newPassword1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );

      expect(response.status).toBe(200);
      const corpo = await response.json();
      expect(corpo).toEqual({
        id: corpo.id,
        username: "newPassword1",
        email: "newPassword1@gmail.com",
        password: corpo.password,
        features: corpo.features,
        created_at: corpo.created_at,
        updated_at: corpo.updated_at,
      });

      expect(uuidVersion(corpo.id)).toBe(4);
      expect(Date.parse(corpo.created_at)).not.toBe(NaN);
      expect(Date.parse(corpo.updated_at)).not.toBe(NaN);
      expect(corpo.updated_at).not.toEqual(corpo.created_at);

      const usuarioNoBanco = await user.findOneByUsername("newPassword1");
      const correctPasswordMatch = await password.compare(
        "newPassword2",
        usuarioNoBanco.password,
      );
      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "newPassword1",
        usuarioNoBanco.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
