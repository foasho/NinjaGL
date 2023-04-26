import { NinjaEngine, NinjaEngineContext, NinjaEngineProvider } from "./NinjaEngineManager";
import React, { useContext, useEffect, useRef, useState } from "react";
import { loadNJCFileFromURL } from "./NinjaFileControl";
import { RenderProps } from "@react-three/fiber";
import { NinjaCanvas } from "./NinjaCanvas";

export interface INinjaCanvasProps {
  children?: React.ReactNode;
  canvasProps?: RenderProps<HTMLCanvasElement>;
}
export interface INinjaGLProps extends INinjaCanvasProps {
  njcPath?: string;
}

export const NinjaGL = (props: INinjaGLProps) => {

  return (
    <NinjaEngineProvider>
      <NinjaCanvas {...props}>
      </NinjaCanvas>
    </NinjaEngineProvider>
  )
}