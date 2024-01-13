"use client";

import React from "react";

import { NextUIProvider } from "@nextui-org/react";

import { CanvasLayout } from "@/commons/layouts/CanvasLayout";

function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <CanvasLayout>{children}</CanvasLayout>
    </NextUIProvider>
  );
}

export default RootProvider;
