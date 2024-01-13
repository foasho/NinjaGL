"use client";
import tunnel from "tunnel-rat";

export const r3f = tunnel();

export const Three = ({ children }) => {
  return <r3f.In>{children}</r3f.In>;
};
