"use client";

import React from "react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import {NextUIProvider} from "@nextui-org/react";

function RootProvider(
  { 
    children, 
    session 
  }: {
    children: React.ReactNode;
    session?: Session;
  }
  ) {
  return (
    <NextUIProvider>
      <SessionProvider session={session} refetchInterval={0}>
        {children}
      </SessionProvider>
    </NextUIProvider>
  )
}

export default RootProvider;