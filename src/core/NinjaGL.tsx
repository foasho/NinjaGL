import { NinjaEngine, NinjaEngineContext } from "@/core/Core/NinjaEngineManager";
import { InitNinja } from "@/core/Core/NinjaInit";
import { INinjaProps } from "@/core/Core/NinjaProps";
import { useEffect, useState } from "react";
import { NinjaCanvas } from "./NinjaCanvas";
import { NinjaUI } from "./NinjaUI";

export interface INinjaGLProps {
  jsonPath?: string;
  canvasHeight?: any;
  canvasWidth?: any;
}

export const NinjaGL = (props: INinjaGLProps) => {
  const [engine, setEngine] = useState<NinjaEngine>();
  useEffect(() => {
    const fetchEngine = async () => {
      const _engine = new NinjaEngine();
      if (props.jsonPath && props.jsonPath.length > 3) {
        await _engine.setJson(props.jsonPath);
      }
      else {
        await _engine.setJson(defaultProjectJsonPath);
      }
      setEngine(_engine);
    }
    fetchEngine();
    return () => {
    }
  }, []);

  return (
    <>
      <div id="Ninjaviewer" style={{ height: "100%" }}>
        {engine &&
          <NinjaEngineContext.Provider value={engine}>
            <NinjaCanvas />
          </NinjaEngineContext.Provider>
        }
      </div>
    </>
  )
}

const defaultProjectJsonPath = "savedata/default.json";