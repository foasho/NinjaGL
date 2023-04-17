import { useContext, useEffect, useState } from "react";
import { NinjaEditorContext } from "../NinjaEditorManager";
import { IScriptManagement } from "ninja-core";
import { useTranslation } from "react-i18next";
import styles from "@/App.module.scss";
import { InitScriptManagement } from "ninja-core";
import { useSnapshot } from "valtio";
import { globalScriptStore } from "../Store";
import { MathUtils } from "three";
import Swal from "sweetalert2";

export const ScriptNavigation = () => {
  const editor = useContext(NinjaEditorContext);
  const [sms, setSMs] = useState<IScriptManagement[]>([]);
  const { t } = useTranslation();
  useEffect(() => {
    setSMs([...editor.getSMs()]);
    const handleSMsChanged = () => {
      setSMs([...editor.getSMs()]);
    }
    editor.onSMsChanged(handleSMsChanged);
    return () => {
      editor.offSMsChanged(handleSMsChanged);
    }
  }, [editor]);

  /**
   * Scriptをドラッグ＆ドロップしたときの処理
   */
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = editor.contentsSelectType;
    if (type === "js") {
      const filePath = editor.contentsSelectPath;
      const sm = {...InitScriptManagement};
      sm.id = MathUtils.generateUUID();
      const scriptCheck = async () => {
        try {
          const response = await fetch(filePath);
          if (response.ok) {
            const text = await response.text();
            const searchString = "initialize";
            const searchString2 = "frameLoop";
            if (
              text.includes(searchString) 
              && text.includes(searchString2)
            ) {  
              sm.script = text;
              return true;
            }
          }
        } catch (error) {
          console.error("Error fetching file:", error);
        }
        return false;
      };
      const result = await scriptCheck();
      if (result) {
        sm.name = filePath.split("/").pop() || "";
        const success = editor.setSM(sm);
        if (!success) {
          Swal.fire({
            title: t("scriptError"),
            text: t("scriptErrorAlreadyText"),
            icon: "error",
          });
        }
      }
      else {
        Swal.fire({
          title: t("scriptError"),
          text: t("scriptErrorText"),
          icon: "error",
        });
      }
    };

  }

  const handleDragOver = (e) => {
    e.preventDefault(); // ブラウザのデフォルト動作をキャンセルする
  };

  return (
    <>
      <div>
        <div className={styles.title}>
          {t("scriptNavigator")}
        </div>
        <div 
          className={styles.tree}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {sms.map((sm, idx) => {
            return (
              <ScriptItem sm={sm} index={idx} key={idx} />
            )
          })}
        </div>
      </div>
    </>
  )
}

const ScriptItem = (prop: { index: number, sm: IScriptManagement }) => {
  const scriptState = useSnapshot(globalScriptStore);
  const { t } = useTranslation();
  let lineStyle = styles.lightLine;
  if (prop.index % 2 !== 0) {
    lineStyle = styles.darkLine;
  }
  const selectStyle = (scriptState.currentSM && scriptState.currentSM.id == prop.sm.id) ? styles.select : "";
  
  const onClickItem = () => {
    if (scriptState.currentSM && scriptState.currentSM.id == prop.sm.id) {
      globalScriptStore.currentSM = null;
      return;
    }
    globalScriptStore.currentSM = prop.sm;
  }
  
  return (
    <div className={styles.treeNode + " " + selectStyle} onClick={onClickItem}>
      <div className={lineStyle}>
        <div className={styles.name}>
          {prop.sm.name}
        </div>
      </div>
    </div>
  )
}
