"use client";
import React, { createContext, useEffect } from "react";
import { redirect } from "next/navigation";
import { Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";

import { Loading2D } from "@/commons/Loading2D";

/**
 * 認証済みかどうかを判定して、認証済みなら子コンポーネントを表示する
 */
export type AuthProviderProps = "secure" | "optional" | "public";
const AuthContainer = ({
  children,
  session,
  type,
}: {
  children: React.ReactNode;
  session?: Session;
  type: AuthProviderProps;
}) => {
  return (
    <SessionProvider session={session} refetchInterval={0}>
      <AuthProvider type={type}>{children}</AuthProvider>
    </SessionProvider>
  );
};

const AuthContext = createContext<{ type: AuthProviderProps; user: any }>({} as { type: AuthProviderProps; user: any });
export const useAuth = () => React.useContext(AuthContext);
export const AuthProvider = ({ children, type }: { children: React.ReactNode; type: AuthProviderProps }) => {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Secureの場合、sessionがなければログインページにリダイレクトする
    if (type === "secure" && !session && status !== "loading") {
      // 現在のURLをcallbackUrlとして渡す
      const callbackUrl = window.location.pathname;
      redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [session, status, type]);

  return (
    <AuthContext.Provider
      value={{
        type: type,
        user: session?.user,
      }}
    >
      {status === "loading" ? <Loading2D /> : <>{children}</>}
    </AuthContext.Provider>
  );
};

export default AuthContainer;
