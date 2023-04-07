import { NinjaEngine, NinjaEngineContext } from "@/core/utils/NinjaEngineManager";
import { InitNinja } from "@/core/utils/NinjaInit";
import { INinjaProps } from "@/core/utils/NinjaProps";
import { useEffect, useState } from "react";
import { NinjaCanvas } from "./NinjaCanvas";
import { NinjaUI } from "./NinjaUI";

export interface INinjaGLProps {
  jsonPath?: string;
  njcPath?: string;
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
      else if (props.njcPath && props.njcPath.length > 3){
        await _engine.setNJCPath(props.njcPath);
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

  const height = props.canvasHeight? props.canvasHeight: "100%";
  const width = props.canvasWidth? props.canvasWidth: "100%";

  return (
    <>
      <div id="Ninjaviewer" style={{ height: height, width: width }}>
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