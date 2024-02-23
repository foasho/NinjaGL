import type { User } from "next-auth";

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { getOrCreateUserByEmail } from "@/db/crud/user";

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
      // GoogleSignOn
      if (session.user && session.user.email) {
        // メールアドレスがあれば作成
        const user = await getOrCreateUserByEmail(session.user.email, session.user.name!, session.user.image!);

        // @ts-ignore
        session.user = user;
      }

      return session;
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
