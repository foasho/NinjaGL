import { NinjaEngine, NinjaEngineContext } from "@ninjagl/core";
import { NinjaCanvas } from "@ninjagl/core";
import { useContext, useEffect, lazy, Suspense, useState } from "react"
import { NinjaEditorContext, NinjaEditorManager } from "../NinjaEditorManager";
import { SkeletonUtils } from "three-stdlib";
import { NJCFile } from "@ninjagl/core";
import { IConfigParams } from "@ninjagl/core";
import { globalConfigStore } from "../Store";
import { useSnapshot } from "valtio";

export const ExportNjcFile = (
  editor: NinjaEditorManager,
  config: IConfigParams,
): NJCFile => {
  const newConfig = { ...config, dpr: undefined };
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
      if (om.animations && om.animations.length > 0) {
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
  const ums = [...editor.getUMs()];
  const tms = [...editor.getTMs()];
  const sms = [...editor.getSMs()];
  // Configパラメータを設定する
  const _config: IConfigParams = {
    ...newConfig,
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
  const [ready, setReady] = useState(false);
  const configState = useSnapshot(globalConfigStore);
  const editor = useContext(NinjaEditorContext);
  const [engine, setEngine] = useState(null);
  useEffect(() => {
    const njcFile = ExportNjcFile(editor.getEditor(), {
      physics: configState.physics,
      autoScale: configState.autoScale,
      alpha: configState.alpha,
      logarithmicDepthBuffer: configState.logarithmicDepthBuffer,
      antialias: configState.antialias,
      shadowResolution: configState.shadowResolution,
      mapsize: configState.mapsize,
      layerGridNum: configState.layerGridNum,
      lodDistance: configState.lodDistance,
      dpr: undefined,
      viewGridLength: configState.viewGridLength,
      initCameraPosition: configState.initCameraPosition,
      octreeDepth: configState.octreeDepth,
      isDebug: true,
    });
    const setupNjcFile = async (nf) => {
      const _engine = new NinjaEngine();
      await _engine.setNJCFile(nf);
      setEngine(_engine);
      setReady(true);
    }
    setupNjcFile(njcFile);
    return () => {
      setReady(false);
    }
  }, []);

  return (
    <>
      <div id="Ninjaviewer" style={{ height: "100%" }}>
        {ready && engine &&
          <NinjaEngineContext.Provider value={engine}>
            <NinjaCanvas />
          </NinjaEngineContext.Provider>
        }
      </div>
    </>
  )
}

const LoadingComponent = () => {
  return (
    <>
      <div style={{ height: "100%", width: "100%", top: "0", left: "0", backgroundColor: "black", zIndex: 9999 }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <div style={{ color: "white", fontSize: "20px" }}>
            Loading...
          </div>
        </div>
      </div>
    </>
  )
}