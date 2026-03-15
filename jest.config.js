// aqui vamos fazer a conexao entre o mundo arcaico do jest com o js moderno
// dois problemas do jest: nao ter uma boa conexao com o esm e nao ter absolute imports

const nextJest = require("next/jest");
const env = require("dotenv");
fazerResultado = nextJest();
resultado = fazerResultado({
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
});
env.config({ path: ".env.development" });
module.exports = resultado;
