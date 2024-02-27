"use client";
import dynamic from "next/dynamic";
import { type IConfigParams, type IObjectManagement, type IScriptManagement } from "@ninjagl/core";

type PreviewNinjaProps = {
  oms: IObjectManagement[];
  sms: IScriptManagement[];
  config: IConfigParams;
};
export const PreviewNinjaGL = ({ oms, sms, config }: PreviewNinjaProps) => {
  const Preview = dynamic(() => import("@/commons/Preview").then((mod) => mod.PreviewComponent), {
    ssr: false,
  });
  return <Preview oms={oms} sms={sms} config={config} />;
};
