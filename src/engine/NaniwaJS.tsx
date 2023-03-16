import { NaniwaEngine, NaniwaEngineContext } from "@/engine/Core/NaniwaEngineManager";
import { InitNaniwa } from "@/engine/Core/NaniwaInit";
import { INaniwaProps } from "@/engine/Core/NaniwaProps";
import { useEffect, useState } from "react";
import { NaniwaCanvas } from "./NaniwaCanvas";
import { NaniwaUI } from "./NaniwaUI";

export interface INaniwaJSProps {
  jsonPath?: string;
  canvasHeight?: any;
  canvasWidth?: any;
}

export const NaniwaJS = (props: INaniwaJSProps) => {
  const [engine, setEngine] = useState<NaniwaEngine>();
  useEffect(() => {
    const fetchEngine = async () => {
      const _engine = new NaniwaEngine();
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
      <div id="naniwaviewer" style={{ height: "100%" }}>
        {engine &&
          <NaniwaEngineContext.Provider value={engine}>
            <NaniwaCanvas />
          </NaniwaEngineContext.Provider>
        }
      </div>
    </>
  )
}

const defaultProjectJsonPath = "savedata/default.json";