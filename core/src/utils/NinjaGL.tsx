import { NinjaEngine, NinjaEngineContext } from "./NinjaEngineManager";
import React, { useEffect, useState } from "react";
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
  const [engine, setEngine] = useState<NinjaEngine>();

  useEffect(() => {
    const fetchEngine = async () => {
      const _engine = new NinjaEngine();
      if (props.njcPath) {
        // ロード時間を計測する
        const startTime = new Date().getTime();
        const data = await loadNJCFileFromURL(props.njcPath);
        const endTime = new Date().getTime();
        console.info(`LoadNJCFileFromURL LoadTime: ${endTime - startTime}ms`);
        console.log(data);
        _engine.setNJCFile(data).then(() => {
          // エンジンにセット
          setEngine(_engine);
        });
      }
      else {
        setEngine(_engine);
      }
    }
    fetchEngine();
    return () => {
      setEngine(undefined);
    }
  }, [props.njcPath]);

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