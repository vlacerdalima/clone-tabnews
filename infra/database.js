import { Client } from "pg";

async function query(objeto) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });
  await client.connect();
  const resultado = await client.query(objeto);
  // tá recebendo um prompt (objeto) .  O client vai se conectar ao psql e fzr essa query
  await client.end();
  return resultado;
}

export default {
  query: query,
};
