import base from "./base.js";

export default [
  ...base,
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-console": ["warn", { "allow": ["warn", "error"] }]
    }
  }
];
