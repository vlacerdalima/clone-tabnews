import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [".next/**", "node_modules/**", "dist/**"],
  },

  js.configs.recommended,

  // ---> MOVA O PLUGIN DO REACT PARA CÁ <---
  pluginReact.configs.flat.recommended,

  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Como isso vem DEPOIS do pluginReact, agora essa regra vai vencer!
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "warn",
    },
  },
]);
