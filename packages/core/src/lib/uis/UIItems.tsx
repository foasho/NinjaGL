import React, { useEffect } from "react";
import { UIButtons } from "./UIButtons";
import { UILabels } from "./UILabels";
import { UITextInputs } from "./UITextInputs";
import { TouchController } from "./TouchController";
import { NinjaLoader } from "./NinjaLoader";
import { CommunicationUI } from "./TemplateUI/CommunicationUI";
import { EDeviceType, useNinjaEngine } from "../hooks";
import { SystemMenuUI } from "./TemplateUI/SystemMenuUI";

export const UIItems = React.memo(() => {
  const { config, device } = useNinjaEngine();
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => {
    // 1秒後にマウント
    setTimeout(() => {
      setMounted(true);
    }, 1000);
    return () => {
      setMounted(false);
    };
  }, [config.multi]);
  return (
    <>
      {mounted && (
        <>
          <UIButtons />
          <UILabels />
          <UITextInputs />
          <TouchController />
          <NinjaLoader />
          {config.multi && <CommunicationUI />}
          <SystemMenuUI />
        </>
      )}
    </>
  );
});
