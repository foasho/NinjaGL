import { NinjaEngine, NinjaEngineContext } from "./NinjaEngineManager";
import React from "react";
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
    <NinjaEngineContext.Provider value={new NinjaEngine()}>
      <NinjaCanvas {...props}>
      </NinjaCanvas>
    </NinjaEngineContext.Provider>
  )
}