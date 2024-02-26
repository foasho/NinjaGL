import { migrate } from "drizzle-orm/pg-proxy/migrator";

import { connection, db } from "@/db";

import "dotenv/config";

//@ts-ignore
await migrate(db, { migrationsFolder: "./lib/db/migrations" });

//@ts-ignore
await connection.end();
