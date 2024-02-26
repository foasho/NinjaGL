import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

let DURL = process.env.POSTGRES_URL as string | undefined;
// sslmode=require が必要
if (!DURL) {
  throw new Error(`POSTGRES_URL is not defined: URL=${DURL}`);
}
if (!DURL.includes("sslmode") && !process.env.NEXTAUTH_URL?.includes("localhost")) {
  DURL = DURL + "?sslmode=require";
}

export const connection = postgres(DURL);

// @ts-ignore
export const db: PostgresJsDatabase = drizzle(connection, { schema, mode: "planetscale" });
