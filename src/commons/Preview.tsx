"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  ExportNjcFile,
  type IConfigParams,
  initTpConfig,
  type IObjectManagement,
  type IScriptManagement,
  NJCFile,
} from "@ninjagl/core";

import { DeepCopyOM } from "@/utils/convs";

type PreviewNinjaProps = {
  oms: IObjectManagement[];
  sms: IScriptManagement[];
  config: IConfigParams;
};
export const PreviewComponent = ({ oms, sms, config }: PreviewNinjaProps) => {
  const [njcFile, setNjcFile] = useState<NJCFile>();
  const NinjaGL = dynamic(() => import("@ninjagl/core").then((mod) => mod.NinjaGL), {
    ssr: false,
  });

  useEffect(() => {
    const _config = config || initTpConfig();
    const deepOms = oms.map((om) => DeepCopyOM(om));
    const _njcFile = ExportNjcFile(deepOms, [], [], sms, _config, {});
    // Previewモードでは、debugModeをfalseにする
    _njcFile.config.isDebug = false;
    setNjcFile(_njcFile);
  }, []);

  return <>{njcFile && <NinjaGL njc={njcFile} isSplashScreen={false}></NinjaGL>}</>;
};
