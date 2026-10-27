import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "src/lib/api/schema.d.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strict],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["src/components/ui/**", "src/components/shared/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/features/**"],
              message:
                "components/ui and components/shared must not import features (ADR-0001).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/*/components/**", "src/features/*/pages/**"],
    rules: {
      // Presentation components make no API calls (ADR-0001, rule 4): data comes through hooks.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/api/*", "**/api/*"],
              allowTypeImports: true,
              message:
                "Components use hooks for data; only type imports from the API are allowed.",
            },
          ],
        },
      ],
    },
  },
);
