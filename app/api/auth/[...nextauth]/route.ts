import NextAuth from "next-auth";

import { authOptions } from "./nextAuthOpt";

// eslint-disable-next-line no-return-await
const handler = NextAuth(authOptions);

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
  handler as OPTIONS,
  handler as HEAD,
  authOptions,
};
