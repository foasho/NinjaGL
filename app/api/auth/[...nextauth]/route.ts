import NextAuth from "next-auth";

import { authOptions } from "./nextAuthOpt";

// eslint-disable-next-line no-return-await
const handler = NextAuth(authOptions);

export {
  authOptions,
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
