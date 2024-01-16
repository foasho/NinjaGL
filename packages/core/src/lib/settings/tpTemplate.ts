import { NJCFile } from "../utils";
import { ExportNjcFile } from "./funcs";
import { initTpOMs, initTpUMs, initTpSMs, initTpConfig } from "./thirdperson";

export const ThirdPersonTemplate = (): NJCFile => {
  return ExportNjcFile(
    initTpOMs(),
    initTpUMs(),
    [],
    initTpSMs(),
    initTpConfig(),
    {}
  );
};