"use client";

import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { NextUIProvider } from "@nextui-org/react";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { CanvasLayout } from "@/commons/layouts/CanvasLayout";
import { Loading2D } from "@/commons/Loading2D";

function RootProvider({ children, session }: { children: React.ReactNode; session?: Session }) {
  return (
    <NextUIProvider>
      <SessionProvider session={session} refetchInterval={0}>
        <CanvasLayout>
          <Suspense fallback={<Loading2D />}>{children}</Suspense>
          <Toaster />
        </CanvasLayout>
      </SessionProvider>
    </NextUIProvider>
  );
}

export default RootProvider;
