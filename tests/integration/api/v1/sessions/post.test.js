import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";
import activation from "models/activation";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.limpa();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With incorrect `email` but correct `password`", async () => {
      await orchestrator.createUser({
        password: "senha-correta",
      });

      const resp = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.errado@gmail.com",
          password: "senha-correta",
        }),
      });

      expect(resp.status).toBe(401);

      const corpo = await resp.json();

      expect(corpo).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    test("With correct `email` but incorrect `password`", async () => {
      await orchestrator.createUser({
        email: "email.correto@gmail.com",
        password: "senha-correta",
      });

      const resp = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.correto@gmail.com",
          password: "senha-errada",
        }),
      });

      expect(resp.status).toBe(401);

      const corpo = await resp.json();

      expect(corpo).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    test("With incorrect `email` and incorrect `password`", async () => {
      await orchestrator.createUser({});

      const resp = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.incorreto@gmail.com",
          password: "senha-incorreta",
        }),
      });

      expect(resp.status).toBe(401);

      const corpo = await resp.json();

      expect(corpo).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        status_code: 401,
      });
    });

    test("With correct `email` and correct `password`", async () => {
      const createdUser = await orchestrator.createUser({
        email: "tudo.correto@curso.dev",
        password: "tudocorreto",
      });

      await orchestrator.activateUser(createdUser);

      const resp = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "tudo.correto@curso.dev",
          password: "tudocorreto",
        }),
      });

      expect(resp.status).toBe(201);

      const corpo = await resp.json();

      expect(corpo).toEqual({
        id: corpo.id,
        token: corpo.token,
        user_id: createdUser.id,
        expires_at: corpo.expires_at,
        created_at: corpo.created_at,
        updated_at: corpo.updated_at,
      });

      expect(uuidVersion(corpo.id)).toBe(4);
      expect(Date.parse(corpo.created_at)).not.toBe(NaN);
      expect(Date.parse(corpo.updated_at)).not.toBe(NaN);
      expect(Date.parse(corpo.expires_at)).not.toBe(NaN);

      const expiresAt = new Date(corpo.expires_at);
      const createdAt = new Date(corpo.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt - createdAt).toEqual(session.EXPIRATION_IN_MILISSECONDS);

      const parsedSetCookie = setCookieParser(resp, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: corpo.token,
        maxAge: session.EXPIRATION_IN_MILISSECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
