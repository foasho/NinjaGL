import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import * as auth from "./schema/auth";
import * as post from "./schema/post";

export const schema = { ...auth, ...post };

export { mySqlTable as tableCreator } from "./schema/_table";

export * from "drizzle-orm";

const connection = connect({
  host: process.env.POSTGRES_HOST!,
  username: process.env.POSTGRES_USERNAME!,
  password: process.env.POSTGRES_PASSWORD!,
});

export const db = drizzle(connection, { schema });
