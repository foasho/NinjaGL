import { NinjaEngine, NinjaEngineContext } from "@/core/utils/NinjaEngineManager";
import { NinjaCanvas } from "@/core/NinjaCanvas";
import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { NinjaEditorContext } from "../NinjaEditorManager";
import { SkeletonUtils } from "three-stdlib";
import { clone as SkeletonUtilsClone } from "three/examples/jsm/utils/SkeletonUtils";

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
    const ums = editor.getUMs();
    const tms = editor.getTMs();
    const scs = editor.getSCs();
    const config = editor.config;
    const _engine = new NinjaEngine();
    const avatar = editor.getAvatar();
    const terrain = editor.getTerrain();
    const objects = editor.getObjects();
    const sky = editor.getSky();
    const lights = editor.getLights();
    const threes = editor.getThreeObjects();
    const jsonData: any = {
      config: config,
      terrain: terrain,
      objects: objects,
      threes: threes,
      sky: sky,
      lights: lights
    }
    if (avatar){
      const _avatar = { ...avatar };
      const target = SkeletonUtils.clone(_avatar.object);
      target.animations = avatar.animations;
      _avatar.object = target;
      jsonData.avatar = _avatar;
    }
    _engine.setJsonData(jsonData);
    setEngine(_engine);
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