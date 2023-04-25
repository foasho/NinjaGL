import { useContext, useEffect, useState } from "react";
import { NinjaEditorContext } from "../NinjaEditorManager";
import { IShaderManagement } from "ninjagl-core";
import { useTranslation } from "react-i18next";
import styles from "@/App.module.scss";

export const ShaderNavigation = () => {
  const editor = useContext(NinjaEditorContext);
  const [shaders, setShaders] = useState<IShaderManagement[]>([]);
  const { t } = useTranslation();
  useEffect(() => {
      // setShaders(editor.getShaders());
  }, []);
  return (
      <>
          <div>
              <div className={styles.title}>
                  {t("shaderNavigator")}
              </div>
              <div className={styles.tree}>
                  {shaders.map((shader, idx) => {
                      return (
                          <ShaderItem shader={shader} index={idx} key={idx} />
                      )
                  })}
              </div>
          </div>
      </>
  )
}

const ShaderItem = (prop: { index: number, shader: IShaderManagement }) => {
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
                  {prop.shader.name}
              </div>
          </div>
      </div>
  )
}
