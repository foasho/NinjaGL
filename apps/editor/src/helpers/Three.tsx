"use client";
import tunnel from "tunnel-rat";

export const r3f = tunnel();

interface IThree {
  children?: React.ReactNode;
}
export const Three = ({ children }: IThree) => {
  return <r3f.In>{children}</r3f.In>;
};
