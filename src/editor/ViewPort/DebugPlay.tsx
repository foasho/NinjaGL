"use client";
import { useEffect, useState } from "react";
import {
  IConfigParams,
  IObjectManagement,
  IScriptManagement,
  ITextureManagement,
  IUIManagement,
  NinjaGL,
  NJCFile,
} from "@ninjagl/core";
import { useSnapshot } from "valtio";

import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { globalConfigStore } from "../Store/Store";

export const ExportNjcFile = (
  oms: IObjectManagement[],
  ums: IUIManagement[],
  tms: ITextureManagement[],
  sms: IScriptManagement[],
  config: IConfigParams,
): NJCFile => {
  const newConfig = { ...config };
  // Configパラメータを設定する
  const _config: IConfigParams = {
    ...newConfig,
    isDebug: true,
  };

  const njcFile = new NJCFile();
  njcFile.setConfig(_config);
  njcFile.setOMs(oms);
  njcFile.setUMs(ums);
  njcFile.setTMs(tms);
  njcFile.setSMs(sms);
  return njcFile;
};

/**
 * OMとUIから一時的なJSONデータを生成し、
 * NinjaEngineを実行する
 */
export const DebugPlay = () => {
  const configState = useSnapshot(globalConfigStore);
  const editor = useNinjaEditor();
  const [njcFile, setNJCFile] = useState<NJCFile | null>(null);

  useEffect(() => {
    const _njcFile = ExportNjcFile(editor.oms.current, editor.ums.current, editor.tms.current, editor.sms.current, {
      physics: configState.physics,
      multi: configState.multi,
      isApi: configState.isApi,
      isDebug: configState.isDebug,
      projectName: configState.projectName,
    });
    setNJCFile(_njcFile);
    return () => {
      setNJCFile(null);
    };
  }, [
    configState.isApi,
    configState.isDebug,
    configState.multi,
    configState.physics,
    configState.projectName,
    editor.oms,
    editor.sms,
    editor.tms,
    editor.ums,
  ]);

  return (
    <div id='Ninjaviewer' className='relative h-full'>
      {njcFile && <NinjaGL njc={njcFile} isSplashScreen={false}></NinjaGL>}
    </div>
  );
};
