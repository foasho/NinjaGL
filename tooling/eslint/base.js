/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    "turbo",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "prettier",
  ],
  env: {
    es2022: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: { project: true },
  "plugins": ["@typescript-eslint", "unused-imports", "simple-import-sort", "react", "import"],
  rules: {
    "simple-import-sort/imports": [
      "error",
      {
        "groups": [
          // type (e.g. `import type { ... } from "..."`)
          ["^.*\\u0000$"],
          // `react`.
          [
            "^react",
            // `next`
            "^next\\/",
            // things that start with a letter (or digit or underscore), or `@` followed by a letter
            "^@?\\w",
          ],
          // internal
          ["^@/"],
          // relative parent (e.g. `import ... from ".."`)
          ["^\\.\\.(?!/?$)"],
          ["^\\.\\./?$"],
          // relative same folder (e.g. `import ... from "./"`)
          ["^\\./(?=.*/)(?!/?$)"],
          ["^\\.(?!/?$)"],
          ["^\\./?$"],
          // side effect (e.g. `import "./foo"`)
          ["^\\u0000"],
          // css
          ["^.+\\.s?css$"],
        ],
      },
    ],
    "simple-import-sort/exports": "error",
    // "unused-imports/no-unused-imports": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "@typescript-eslint/no-empty-function": "off",
  },
  ignorePatterns: [
    "**/*.config.js",
    "**/*.config.cjs",
    "**/.eslintrc.cjs",
    ".next",
    "dist",
    "pnpm-lock.yaml",
  ],
  reportUnusedDisableDirectives: true,
  settings: {
    "react": {
      "version": "detect"
    }
  }
};

module.exports = config;
