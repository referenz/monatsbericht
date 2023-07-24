module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:svelte/recommended",
    "plugin:svelte/prettier"
  ],
  rules: {
    "@typescript-eslint/restrict-template-expressions": "warn",
    "@typescript-eslint/naming-convention": "warn"
  },
  ignorePatterns: ['.eslintrc.cjs', 'vite.config.ts'],

  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: true,
    tsconfigRootDir: __dirname,
    extraFileExtensions: [".svelte"]
  },
  plugins: [
    "@typescript-eslint"
  ],
  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
      parserOptions: {
        parser: "@typescript-eslint/parser"
      }
    }

  ],
  env: {
    browser: true
  },
  root: true
}