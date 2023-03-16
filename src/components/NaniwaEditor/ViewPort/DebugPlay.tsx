import { NaniwaEngine, NaniwaEngineContext } from "@/engine/core/NaniwaEngineManager";
import { NaniwaCanvas } from "@/engine/NaniwaCanvas";
import { useContext, useEffect, useState } from "react"
import { NaniwaEditorContext } from "../NaniwaEditorManager"

 /**
 * OMとUIから一時的なJSONデータを生成し、
 * NaniwaEngineを実行する
 */
export const DebugPlay = () => {
  const editor = useContext(NaniwaEditorContext);
 
  const [jsonPath, setJsonPath] = useState<string>(null);
  const [engine, setEngine] = useState<NaniwaEngine>();
  useEffect(() => {
    if (jsonPath) {
      const _engine = new NaniwaEngine();
      _engine.setJson(jsonPath);
      setEngine(_engine);
    }
    else {
      // EditorからOMを取得してJSON化する
      const oms = editor.oms;
      const uis = editor.uis;
      
    }
    return () => {
      setJsonPath(null);
    }
  }, [jsonPath]);

  return (
    <>
      <div style={{ height: "100vh" }}>
        {engine &&
          <NaniwaEngineContext.Provider value={engine}>
            <NaniwaCanvas />
          </NaniwaEngineContext.Provider>
        }
      </div>
    </>
  )
}