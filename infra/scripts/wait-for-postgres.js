// objetivo daq é gerar uma flag para dizer se a db
// está acessível para nao ter RC com as migrations

import { exec } from "node:child_process";

function checa() {
  exec("docker exec postgres-dev pg_isready --host localhost", lide);

  function lide(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checa();
      return;
    }
    // se chegou aqui é pq deu bom
    console.log("\n Disponível para conexão!");
  }
}

process.stdout.write("\n\nAguardando disponibilidade do psql.");
checa();
