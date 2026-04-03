import pluginJs from "@eslint/js";
import markdown from "@eslint/markdown";
import {defineConfig} from "eslint/config";
import globals from "globals";

export default defineConfig([
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {files: ["**/*.js", "**/*.mjs"], languageOptions: {globals: {...globals.browser, ...globals.node}}, extends: [pluginJs.configs.recommended]},
  {files: ["**/*.md"], plugins: {markdown}, extends: ["markdown/recommended"], language: "markdown/gfm"},
]);
