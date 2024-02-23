"use client";
import React, { createContext, useEffect } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { Loading2D } from "@/commons/Loading2D";

export type AuthProviderProps = "secure" | "optional" | "public";
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
  }, [session, status]);

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
