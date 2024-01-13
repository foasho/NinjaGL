import { Auth } from "@auth/core";
import Google from "@auth/core/providers/google";
// import Discord from "@auth/core/providers/discord";
import { eventHandler, toWebRequest } from "h3";

export default eventHandler(async (event) =>
  Auth(toWebRequest(event), {
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: !!process.env.VERCEL,
    redirectProxyUrl: process.env.NEXTAUTH_URL,
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
      // Discord({
      //   clientId: process.env.AUTH_DISCORD_ID,
      //   clientSecret: process.env.AUTH_DISCORD_SECRET,
      // }),
    ],
  }),
);
