import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import security from "eslint-plugin-security";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "security": security,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...security.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn", // Allow any in API files and external lib integrations
      "@typescript-eslint/no-unused-expressions": "off", // Disable to avoid compatibility issues with ESLint 9
      // Security rules that fail the build
      "security/detect-object-injection": "warn", // Many false positives with safe object property access
      "security/detect-eval-with-expression": "error",
      "security/detect-non-literal-fs-filename": "error",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "error",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-new-buffer": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-possible-timing-attacks": "error",
      "security/detect-pseudoRandomBytes": "error",
      "no-console": ["error", { "allow": ["error"] }],
    },
  },
  // Allow console in scripts and e2e directories
  {
    files: ["scripts/**/*.{ts,tsx}", "e2e/**/*.{ts,tsx}"],
    rules: {
      "no-console": "off",
    },
  }
);
