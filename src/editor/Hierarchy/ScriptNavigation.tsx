import { useContext, useEffect, useState } from "react";
import { NinjaEditorContext } from "../NinjaEditorManager";
import { IScriptManagement } from "@/core/utils/NinjaProps";
import { useTranslation } from "react-i18next";
import styles from "@/App.module.scss";

export const ScriptNavigation = () => {
  const editor = useContext(NinjaEditorContext);
  const [scripts, setScripts] = useState<IScriptManagement[]>([]);
  const { t } = useTranslation();
  useEffect(() => {
      // setScripts(editor.getScripts());
  }, []);
  return (
      <>
          <div>
              <div className={styles.title}>
                  {t("scriptNavigator")}
              </div>
              <div className={styles.tree}>
                  {scripts.map((script, idx) => {
                      return (
                          <ScriptItem script={script} index={idx} />
                      )
                  })}
              </div>
          </div>
      </>
  )
}

const ScriptItem = (prop: { index: number, script: IScriptManagement }) => {
  const { t } = useTranslation();
  let lineStyle = styles.lightLine;
  if (prop.index % 2 !== 0) {
      lineStyle = styles.darkLine;
  }
  return (
      <div className={styles.treeItem}>
          <div className={lineStyle}></div>
          <div className={styles.item}>
              <div className={styles.itemName}>
                  {prop.script.name}
              </div>
          </div>
      </div>
  )
}
