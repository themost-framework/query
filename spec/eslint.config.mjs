import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import pluginJest from "eslint-plugin-jest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        "**/*.d.ts",
        "eslint.config.mjs",
    ],
}, ...compat.extends("eslint:recommended"), {
    plugins: {
        jest: pluginJest,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
            ...pluginJest.environments.globals.globals,
        },
        ecmaVersion: 2020,
        sourceType: "module",
    }
}];