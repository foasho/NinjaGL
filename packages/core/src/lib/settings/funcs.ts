import {
  IObjectManagement,
  IUIManagement,
  ITextureManagement,
  IScriptManagement,
  IConfigParams,
  NJCFile,
  kvsProps,
} from "../utils";

export const ExportNjcFile = (
  oms: IObjectManagement[],
  ums: IUIManagement[],
  tms: ITextureManagement[],
  sms: IScriptManagement[],
  config: IConfigParams,
  kvs: kvsProps
): NJCFile => {
  const newConfig = { ...config, dpr: undefined };
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
  njcFile.setKVS(kvs);
  return njcFile;
};