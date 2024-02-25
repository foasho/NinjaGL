"use client";
import { ExportNjcFile, IConfigParams, IObjectManagement, IScriptManagement, NinjaGL } from "@ninjagl/core";

type PreviewNinjaProps = {
  oms: IObjectManagement[];
  sms: IScriptManagement[];
  config: IConfigParams;
};
export const PreviewNinjaGL = ({ oms, sms, config }: PreviewNinjaProps) => {
  const njcFile = ExportNjcFile(oms, [], [], sms, config, {});
  return <>{njcFile && <NinjaGL njc={njcFile} isSplashScreen={false}></NinjaGL>}</>;
};
