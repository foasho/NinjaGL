/** @type {import('eslint').Linter.Config} */
const config = {
  extends: ["plugin:react/recommended"],
  rules: {
    "react/prop-types": "off",
    "react/no-unknown-property": ["off", { ignore: ["JSX"] }], // r3fのpropsに対してエラーが出るので無効化
  },
  globals: {
    React: "writable",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    browser: true,
  },
};

module.exports = config;
