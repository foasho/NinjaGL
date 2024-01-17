import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const uri = process.env.POSTGRES_URL ?? "";

export default {
  schema: "./src/schema",
  driver: "pg",
  dbCredentials: {
    connectionString: uri,
  },
  // tablesFilter: ["t3turbo_*"],
} satisfies Config;
