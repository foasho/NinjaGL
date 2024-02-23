import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL as string,
  },
  verbose: true,
  strict: false, // pushする前に承認を求めない
} satisfies Config;
