import { useTranslation } from "react-i18next";
import { InitScriptManagement, IScriptManagement } from "@ninjagl/core";
import { MathUtils } from "three";
import { useSnapshot } from "valtio";

import { MySwal } from "@/commons/Swal";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { globalScriptStore } from "../Store/Store";

export const ScriptNavigation = () => {
  const { sms, contentsSelectType, contentsSelectPath, addSM } = useNinjaEditor();
  const { t } = useTranslation();

  /**
   * Scriptをドラッグ＆ドロップしたときの処理
   */
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = contentsSelectType;
    if (type === "js") {
      const filePath = contentsSelectPath;
      const sm = { ...InitScriptManagement };
      sm.id = MathUtils.generateUUID();
      const scriptCheck = async () => {
        if (!filePath) return false;
        try {
          const response = await fetch(filePath);
          if (response.ok) {
            const text = await response.text();
            const searchString = "initialize";
            const searchString2 = "frameLoop";
            if (text.includes(searchString) && text.includes(searchString2)) {
              sm.script = text;
              return true;
            }
          }
        } catch (error) {}
        return false;
      };
      const result = await scriptCheck();
      if (result && filePath) {
        sm.name = filePath.split("/").pop() || "";
        const success = addSM(sm);
        if (!success) {
          MySwal.fire({
            title: t("scriptError"),
            text: t("scriptErrorAlreadyText"),
            icon: "error",
          });
        }
      } else {
        MySwal.fire({
          title: t("scriptError"),
          text: t("scriptErrorText"),
          icon: "error",
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // ブラウザのデフォルト動作をキャンセルする
  };

  return (
    <>
      <div className='rounded-sm border-1 border-white p-1'>
        <div onDrop={handleDrop} onDragOver={handleDragOver}>
          {sms.current.map((sm, idx) => {
            return <ScriptItem sm={sm} index={idx} key={idx} />;
          })}
        </div>
      </div>
    </>
  );
};

const ScriptItem = (prop: { index: number; sm: IScriptManagement }) => {
  const scriptState = useSnapshot(globalScriptStore);
  let lineBgStyle = "bg-[#797272]";
  if (prop.index % 2 !== 0) {
    lineBgStyle = "bg-[#4b4848]";
  }
  const selectStyle = scriptState.currentSM && scriptState.currentSM.id == prop.sm.id ? "select" : "";

  const onClickItem = () => {
    if (scriptState.currentSM && scriptState.currentSM.id == prop.sm.id) {
      globalScriptStore.currentSM = null;
      return;
    }
    globalScriptStore.currentSM = prop.sm;
  };

  return (
    <div className={`text-xs ${lineBgStyle} ` + selectStyle} onClick={onClickItem}>
      <div>
        <div>{prop.sm.name}</div>
      </div>
    </div>
  );
};
