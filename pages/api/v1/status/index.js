import database from "infra/database.js";
import { version } from "react";

async function aux(request, response) {
  const agr = new Date().toISOString();
  //como o objeto criado pelo date nao será mais referenciado , diferente de cpp o objeto será
  // deletado sozinho
  const pedir_versao = await database.query(
    "SELECT current_setting('server_version') AS versao_numero;",
  );
  const conecAgr = await database.query(
    "SELECT count(*) AS current FROM pg_stat_activity WHERE datname = 'db_local';",
  );
  const conecMax = await database.query(
    "SELECT setting::int AS max_connections FROM pg_settings WHERE name = 'max_connections';",
  );

  const conexoesMaximas = parseInt(conecMax.rows[0].max_connections);
  const qtdAgr = parseInt(conecAgr.rows[0].current);
  const versao = pedir_versao.rows[0].versao_numero;
  // console.log(versao);
  // console.log(qtdAgr);
  // console.log(conexoesMaximas);
  response.status(200).json({
    data_agr: agr,
    psql_version: versao,
    conexoes_maximas: conexoesMaximas,
    conexos_agora: qtdAgr,
  });
}

export default aux;
