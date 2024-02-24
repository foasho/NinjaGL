import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let DURL = process.env.DATABASE_URL as string | undefined;
// sslmode=require が必要
if (!DURL) {
  throw new Error("POSTGRES_URL is not defined");
}
if (!(DURL).includes("sslmode")) {
  DURL = DURL + "?sslmode=require";
}

const queryClient = postgres(DURL);

export const db: PostgresJsDatabase = drizzle(queryClient);
