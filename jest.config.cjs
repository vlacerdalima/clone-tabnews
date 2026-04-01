const nextJest = require("next/jest");
const env = require("dotenv");

// Carrega as variáveis de ambiente antes de tudo
env.config({ path: ".env.development" });

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
  testEnvironment: "node",
  // Isso diz ao Jest para TRANSFORMAR a node-pg-migrate mesmo ela estando em node_modules
  transformIgnorePatterns: ["/node_modules/(?!(node-pg-migrate)/)"],
};

module.exports = createJestConfig(customJestConfig);
