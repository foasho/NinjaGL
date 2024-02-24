import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

console.info(">>> process.env.VERCEL_URL = ", process.env.VERCEL_URL);

let DURL = process.env.POSTGRES_URL as string | undefined;
// sslmode=require が必要
if (!DURL) {
  throw new Error(`POSTGRES_URL is not defined: URL=${DURL}`);
}
if (!(DURL).includes("sslmode") && !process.env.NEXTAUTH_URL?.includes("localhost")) {
  DURL = DURL + "?sslmode=require";
}

const queryClient = postgres(DURL);

export const db: PostgresJsDatabase = drizzle(queryClient);
