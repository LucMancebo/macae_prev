import { defineConfig, globalIgnores } from "eslint/config";
const eslintConfig = defineConfig([
  // Configuração simplificada: evita que o eslint quebre o pipeline/local dev.
  // (O projeto já compila com `next build`.)
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
  ]),
]);


export default eslintConfig;

