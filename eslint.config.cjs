module.exports = [
  {
    ignores: ["node_modules/**", "dist/**"]
  },

  {
    files: ["src/**/*.ts", "tests/**/*.ts"],

    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2020,
        sourceType: "module"
      }
    },

    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin")
    },

    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",

      // — favour readonly where you don't reassign —
      "@typescript-eslint/prefer-readonly": "error",

      // — encourage “import type” for purely type-only imports —
      "@typescript-eslint/consistent-type-imports": "error",

      // — core JS safety rules —
      "eqeqeq": ["error", "always"],
      "no-debugger": "error",

      // — optional style —
      "quotes": ["error", "single", { avoidEscape: true }],
      "semi": ["error", "always"],
      "comma-dangle": ["error", "always-multiline"]
    }
  }
];
