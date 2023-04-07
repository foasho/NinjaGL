import { NinjaEngine, NinjaEngineContext } from "@/core/utils/NinjaEngineManager";
import { NinjaCanvas } from "@/core/NinjaCanvas";
import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { NinjaEditorContext } from "../NinjaEditorManager"

/**
* OMとUIから一時的なJSONデータを生成し、
* NinjaEngineを実行する
*/
export const DebugPlay = () => {
  const editor = useContext(NinjaEditorContext);
  const [engine, setEngine] = useState<NinjaEngine>();
  const { t } = useTranslation();
  useEffect(() => {
    // EditorからOMを取得してJSON化する
    const oms = editor.oms;
    const ums = editor.ums;
    const config = editor.config;
    const _engine = new NinjaEngine();
    const avatar = editor.getAvatar();
    const terrain = editor.getTerrain();
    const objects = editor.getObjects();
    const sky = editor.getSky();
    const lights = editor.getLights();
    if (!avatar || !terrain){
      Swal.fire({
        icon: "error",
        title: t("errorDebugPlay")
      });
    }
    else {
      const jsonData = {
        config: config,
        avatar: avatar,
        terrain: terrain,
        objects: objects,
        sky: sky,
        lights: lights
      }
      _engine.setJsonData(jsonData);
      setEngine(_engine);
    }
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