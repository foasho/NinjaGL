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
    const _njcFile = ExportNjcFile(oms, [], [], sms, _config, {});
    setNjcFile(_njcFile);
  }, []);

  return <>{njcFile && <NinjaGL njc={njcFile} isSplashScreen={false}></NinjaGL>}</>;
};
