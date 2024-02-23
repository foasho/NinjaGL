"use client";

import React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { CanvasLayout } from "@/commons/layouts/CanvasLayout";

function RootProvider({ children, session }: { children: React.ReactNode; session?: Session }) {
  return (
    <NextUIProvider>
      <SessionProvider session={session} refetchInterval={0}>
        <CanvasLayout>{children}</CanvasLayout>
      </SessionProvider>
    </NextUIProvider>
  );
}

export default RootProvider;
