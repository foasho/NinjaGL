import { NinjaEngine, NinjaEngineContext, NinjaGL } from "ninja-core";
import { NinjaCanvas } from "ninja-core";
import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import { NinjaEditorContext, NinjaEditorManager } from "../NinjaEditorManager";
import { SkeletonUtils } from "three-stdlib";
import { NJCFile } from "ninja-core";
import { IConfigParams, InitMobileConfipParams } from "ninja-core";
import { globalConfigStore } from "../Store";

export const ExportNjcFile = (editor: NinjaEditorManager): NJCFile => {
  // EditorからOMを取得してJSON化する
  const oms = [...editor.getOMs()];
  oms.map((om) => {
    const _om = { ...om };
    if (om.type == "avatar") {
      const target = SkeletonUtils.clone(_om.object);
      target.animations = om.animations;
      _om.object = target;
    }
    else if (om.type == "object" || om.type == "terrain") {
      if (!om.object) return _om;
      // Animationがある場合のみSckeletonUtilsでクローンする
      if (om.animations.length > 0) {
        const target = SkeletonUtils.clone(_om.object);
        target.animations = om.animations;
        _om.object = target;
      }
      else {
        _om.object = om.object.clone();
      }
    }
    return _om;
  });
  console.log("oms length: ", oms.length);
  const ums = [...editor.getUMs()];
  const tms = [...editor.getTMs()];
  const sms = [...editor.getSMs()];
  const config = globalConfigStore;
  // Configパラメータを設定する
  const _config: IConfigParams = {
    ...config,
    isDebug: true,
  }
  
  const njcFile = new NJCFile();
  njcFile.setConfig(_config);
  njcFile.setOMs(oms);
  njcFile.setUMs(ums);
  njcFile.setTMs(tms);
  njcFile.setSMs(sms);
  return njcFile;
}

/**
* OMとUIから一時的なJSONデータを生成し、
* NinjaEngineを実行する
*/
export const DebugPlay = () => {
  const editor = useContext(NinjaEditorContext);
  const [engine, setEngine] = useState<NinjaEngine>();
  const { t } = useTranslation();
  useEffect(() => {
    const _engine = new NinjaEngine();
    const njcFile = ExportNjcFile(editor.getEditor());
    _engine.setNJCFile(njcFile).then(() => {
      // エンジンにセット
      setEngine(_engine);
    });
    return () => {
      setEngine(undefined);
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
        {/* <NinjaGL/> */}
      </div>
    </>
  )
}