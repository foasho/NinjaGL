"use client"
import { useContext, useEffect, useState } from "react"
import { NinjaEditorContext, NinjaEditorManager } from "../NinjaEditorManager";
import { SkeletonUtils } from "three-stdlib";
import { NJCFile, IConfigParams } from "@ninjagl/core";
import { globalConfigStore } from "../Store";
import { useSnapshot } from "valtio";
import dynamic from "next/dynamic";
const NinjaGL = dynamic(() => import("@ninjagl/core").then((mod) => mod.NinjaGL), { ssr: false });
const NinjaCanvas = dynamic(() => import("@ninjagl/core").then((mod) => mod.NinjaCanvas), { ssr: false });
const NinjaCanvasItems = dynamic(() => import("@ninjagl/core").then((mod) => mod.NinjaCanvasItems), { ssr: false });

export const ExportNjcFile = (
  editor: NinjaEditorManager,
  config: IConfigParams,
): NJCFile => {
  const newConfig = { ...config, dpr: undefined };
  // EditorからOMを取得してJSON化する
  const oms = [...editor.getOMs()];
  oms.map((om) => {
    const _om = { ...om };
    if (om.type == "avatar" && _om.object) {
      const target = SkeletonUtils.clone(_om.object);
      target.animations = om.animations? om.animations : [];
      _om.object = target;
    }
    else if (om.type == "object" || om.type == "terrain") {
      if (!om.object) return _om;
      // Animationがある場合のみSckeletonUtilsでクローンする
      if (om.animations && om.animations.length > 0 && _om.object) {
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
  const [njcFile, setNJCFile] = useState<NJCFile|null>(null);
  useEffect(() => {
    const _njcFile = ExportNjcFile(editor.getEditor(), {
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
      initCameraPosition: configState.initCameraPosition,
      isDebug: true,
    });
    setNJCFile(_njcFile);
    return () => {
      setReady(false);
    }
  }, []);

  // omsだけ渡してProviderを作成する
  return (
    <>
      <div id="Ninjaviewer" style={{ height: "100%" }}>
        {njcFile && 
        <NinjaGL njc={njcFile}>
        </NinjaGL>
        }
      </div>
    </>
  )
}