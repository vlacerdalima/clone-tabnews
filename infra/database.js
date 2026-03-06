import { Client } from "pg";

async function query(objeto) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: pegassl(),
  });

  try {
    await client.connect();
    const resultado = await client.query(objeto);
    return resultado;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }

  // tá recebendo um prompt (objeto) .  O client vai se conectar ao psql e fzr essa query
}

export default {
  query: query,
};

function pegassl() {
  // futuramente precisando de um CA pode-se definir aq
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }
  return process.env.NODE_ENV === "production" ? true : false;
}
