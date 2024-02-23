import type { Session } from "next-auth";

import { getOrCreateUserByEmail } from "@/db/crud/user";

export const getMergedSessionServer = async (session: Session) => {
  if (session.user && session.user.email) {
    // メールアドレスがあれば作成
    const user = await getOrCreateUserByEmail(session.user.email, session.user.name!, session.user.image!);

    // @ts-ignore
    session.user = user;
  }
  return session;
};
