import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

export const getUserByEmail = async (email: string) => {
  return await db.select().from(users).where(eq(users.email, email)).limit(1);
};

export const getOrCreateUserByEmail = async (email: string, name: string, image: string) => {
  const user = await getUserByEmail(email);
  if (user.length > 0) {
    return user[0];
  }
  return await createUser(name, email, image);
};

export const createUser = async (name: string, email: string, image: string) => {
  return await db.insert(users).values({
    name,
    email,
    image,
  });
};
