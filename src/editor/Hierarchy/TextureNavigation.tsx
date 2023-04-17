import { useContext, useEffect, useState } from "react";
import { NinjaEditorContext } from "../NinjaEditorManager";
import { ITextureManagement } from "@/src/utils/NinjaProps";
import { useTranslation } from "react-i18next";
import styles from "@/App.module.scss";

export const TextureNavigation = () => {
  const editor = useContext(NinjaEditorContext);
  const [textures, setTextures] = useState<ITextureManagement[]>([]);
  const { t } = useTranslation();
  useEffect(() => {
      // setTextures(editor.getTextures());
  }, []);
  return (
      <>
          <div>
              <div className={styles.title}>
                  {t("textureNavigator")}
              </div>
              <div className={styles.tree}>
                  {textures.map((texture, idx) => {
                      return (
                          <TextureItem texture={texture} index={idx} key={idx} />
                      )
                  })}
              </div>
          </div>
      </>
  )
}

const TextureItem = (prop: { index: number, texture: ITextureManagement }) => {
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
                  {prop.texture.name}
              </div>
          </div>
      </div>
  )
}
