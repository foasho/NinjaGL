import { Auth, AuthConfig } from "@auth/core";
import Google from "@auth/core/providers/google";
import { eventHandler, toWebRequest } from "h3";

export default eventHandler(async (event) => {
  const options = {
    secret: process.env.NEXTAUTH_SECRET,
    redirectProxyUrl: process.env.AUTH_REDIRECT_PROXY_URL,
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    ],
    // trustHost: !!process.env.VERCEL,
    trustHost: true,
  } satisfies AuthConfig;
  return Auth(toWebRequest(event), options);
});
