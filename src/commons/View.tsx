"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

import { OrbitControls, View as ViewImpl } from "@react-three/drei";

import { Three } from "@/helpers/Three";

type ViewProps = {
  children?: React.ReactNode;
} & JSX.IntrinsicElements["div"];
const View = forwardRef(({ children, ...props }: ViewProps, ref) => {
  const localRef = useRef(null);
  useImperativeHandle(ref, () => localRef.current);

  return (
    <>
      <div ref={localRef} {...props} />
      <Three>
        {/* @ts-ignore */}
        <ViewImpl track={localRef}>
          {children}
        </ViewImpl>
      </Three>
    </>
  );
});
View.displayName = "View";

export { View };
