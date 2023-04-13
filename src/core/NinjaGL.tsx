import { NinjaEngine, NinjaEngineContext } from "./NinjaEngineManager";
import { useEffect, useState } from "react";
import { loadNJCFileFromURL } from "./utils/NinjaFileControl";
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
  const [engine, setEngine] = useState<NinjaEngine>();
  useEffect(() => {
    const fetchEngine = async () => {
      const _engine = new NinjaEngine();
      setEngine(_engine);
    }
    fetchEngine();
    return () => {
      setEngine(undefined);
    }
  }, [engine]);

  return (
    <>
      {engine &&
        <NinjaEngineContext.Provider value={engine}>
          <NinjaCanvas {...props} />
        </NinjaEngineContext.Provider>
      }
    </>
  )
}

const defaultProjectJsonPath = "savedata/default.json";