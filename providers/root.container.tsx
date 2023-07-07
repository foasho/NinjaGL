"use client";

import React from "react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

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
    <SessionProvider session={session} refetchInterval={0}>
      {children}
    </SessionProvider>
  )
}

export default RootProvider;