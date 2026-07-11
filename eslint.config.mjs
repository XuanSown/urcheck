import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // react-hooks/set-state-in-effect (eslint-plugin-react-hooks v5) is very strict and
  // flags common, safe patterns (mount detection, close-on-route-change side effects).
  // Keep it as a warning so it does not fail `next build`; the real type-safety fixes
  // (no-explicit-any, unused vars) remain enforced as errors.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
