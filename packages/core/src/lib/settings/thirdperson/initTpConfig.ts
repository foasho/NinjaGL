import { IConfigParams } from "../../utils";

export const initTpConfig = (): IConfigParams => {
  return {
    projectName: "NinjaGL",
    physics: true,
    dpr: 1,
    multi: true,
    isApi: true,
    isDebug: true,
  };
};
