import retry from "async-retry";
import { faker } from "@faker-js/faker";
import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetche, { retries: 100, maxTimeout: 1000 });

    async function fetche() {
      const resposta = await fetch("http://localhost:3000/api/v1/status");
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

export default {
  waitForAllServices,
  limpa,
  runPendingMigrations,
  createUser,
};
