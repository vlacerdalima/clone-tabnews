import { Client } from "pg";
import { ServiceError } from "infra/errors.js";
async function query(objeto) {
  let client;
  try {
    client = await getNewClient();
    const resultado = await client.query(objeto);
    return resultado;
  } catch (error) {
    const erroPublico = new ServiceError({
      cause: error,
      message: "Erro na conexão com o banco de dados ou na query.",
    });
    throw erroPublico;
  } finally {
    await client?.end();
  }

  // tá recebendo um prompt (objeto) .  O client vai se conectar ao psql e fzr essa query
}

export default {
  query,
  getNewClient,
};
async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: pegassl(),
  });
  await client.connect();
  return client;
}
function pegassl() {
  // futuramente precisando de um CA pode-se definir aq
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }
  return process.env.NODE_ENV === "production" ? true : false;
}
