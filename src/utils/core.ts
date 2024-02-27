import { ExportNjcFile, type IConfigParams, initTpConfig, IObjectManagement, IScriptManagement } from "@ninjagl/core";

export const exportNjcFile = async (oms: IObjectManagement[], sms: IScriptManagement[], config: IConfigParams) => {
  const _config = config || initTpConfig();
  return ExportNjcFile(oms, [], [], sms, _config, {});
};
