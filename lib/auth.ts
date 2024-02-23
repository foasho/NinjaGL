import type { User } from "next-auth";

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { getOrCreateUserByEmail } from "@/db/crud/user";
import { getMergedSessionServer } from "./middleware";

export const authOptions: NextAuthOptions = {
  // debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ token, session }) {
      return getMergedSessionServer(session);
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: User & {
      id: number;
      createdAt: string;
      updatedAt: string;
    };
  }
}
