import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";
import { expect, jest } from "@jest/globals";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.limpa();
  await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/sessions", () => {
  describe("Default user", () => {
    test("With nonexistent session", async () => {
      const nonExistentToken =
        "815afa92354866c0c26d3d216b35ce184fe5756f38648c414ae81c41715aef2350d354cf9c6e9fcc43ba830e757158b9";

      const resp2 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${nonExistentToken}`,
        },
      });

      expect(resp2.status).toBe(401);

      const corpo = await resp2.json();

      expect(corpo).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui seção ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILISSECONDS),
      });

      const createdUser = await orchestrator.createUser();

      const sessionObject = await orchestrator.createSession(createdUser.id);
      jest.useRealTimers();
      const resp2 = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(resp2.status).toBe(401);

      const corpo = await resp2.json();

      expect(corpo).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui seção ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser();

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const resp = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(resp.status).toBe(200);

      const corpo = await resp.json();

      expect(corpo).toEqual({
        id: corpo.id,
        token: corpo.token,
        user_id: corpo.user_id,
        expires_at: corpo.expires_at,
        created_at: corpo.created_at,
        updated_at: corpo.updated_at,
      });

      expect(uuidVersion(corpo.id)).toBe(4);
      expect(Date.parse(corpo.created_at)).not.toBe(NaN);
      expect(Date.parse(corpo.updated_at)).not.toBe(NaN);

      expect(corpo.expires_at < sessionObject.expires_at.toISOString()).toEqual(
        true,
      );
      expect(corpo.updated_at > sessionObject.updated_at.toISOString()).toEqual(
        true,
      );

      // Set-Cookie
      const parsedSetCookie = setCookieParser(resp, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });

      // double check
      const doubleCheckResponse = await fetch(
        "http://localhost:3000/api/v1/user",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(doubleCheckResponse.status).toBe(401);

      const doubleCheckResponseBody = await doubleCheckResponse.json();

      expect(doubleCheckResponseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui seção ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });
    });
  });
});
