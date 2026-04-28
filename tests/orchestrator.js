import retry from "async-retry";
import { faker } from "@faker-js/faker";
import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import session from "models/session";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

  async function waitForWebServer() {
    return retry(fetche, { retries: 100, maxTimeout: 1000 });

    async function fetche() {
      const resposta = await fetch("http://localhost:3000/api/v1/status");
      if (resposta.status !== 200) throw Error();
    }
  }

  async function waitForEmailServer() {
    return retry(fetchEmailPage, { retries: 100, maxTimeout: 1000 });

    async function fetchEmailPage() {
      const resposta = await fetch(emailHttpUrl);
      if (resposta.status !== 200) throw Error();
    }
  }
}

async function limpa() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  const retorno = await migrator.runPendingMigrations();
  return retorno;
}

async function createUser(userObject) {
  const usuarioCriado = await user.create({
    username:
      userObject?.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || "validpassword",
  });
  return usuarioCriado;
}

async function createSession(userId) {
  return await session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, { method: "DELETE" });
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();
  const lastEmailItem = emailListBody.pop();

  if (!lastEmailItem) return null;

  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmailItem.id}.plain`,
  );
  const emailTextBody = await emailTextResponse.text();

  lastEmailItem.text = emailTextBody;
  return lastEmailItem;
}

export default {
  waitForAllServices,
  limpa,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
};
