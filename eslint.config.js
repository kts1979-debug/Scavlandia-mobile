const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      "import/no-unresolved": [
        "error",
        {
          ignore: ["@react-native-google-signin/google-signin"],
        },
      ],
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
