import config from "@nordicdrive/eslint-config/next";

export default [
  {
    ignores: [".next/**", "next-env.d.ts", "tsconfig.tsbuildinfo"],
  },
  ...config,
];
