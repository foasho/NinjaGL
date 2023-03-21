import styles from "@/App.module.scss";
import { PlayerEditor } from "@/components/NinjaEditor/ViewPort/PlayerEditor";
import { MainViewer } from "@/components/NinjaEditor/ViewPort/MainViewer";
import { NinjaEditorContext, NinjaEditorManager } from "@/components/NinjaEditor/NinjaEditorManager";
import { useState, useEffect, useContext, useRef } from "react";
import { Object3D, Vector3 } from "three";
import { reqApi } from "@/services/ServciceApi";
import { ContentsBrowser, ContentViewer } from "./Hierarchy/ContentViewer";
import { PivotControls } from "@react-three/drei";
import { IObjectManagement } from "@/engine/Core/NinjaProps";
import { ScriptEditor } from "./ViewPort/ScriptEditor";
import { AiFillHome, AiFillSave, AiOutlinePlus } from "react-icons/ai";
import { TerrainMaker } from "./ViewPort/TerrainMaker";
import { TerrainInspector } from "./Inspector/TerrainInspector";
import { MainViewInspector } from "./Inspector/MainViewInspector";
import { HierarchyTree } from "./Hierarchy/HierarchyTree";
import { BsPlay, BsStop } from "react-icons/bs";
import Swal from "sweetalert2";
import { showSelectNewObjectDialog } from "./Dialogs/SelectNewObjectDialog";
import { generateUUID } from "three/src/math/MathUtils";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PlayerInspector } from "./Inspector/PlayerInspector";
import { ShaderEditor } from "./ViewPort/ShaderEditor";
import { DebugPlay } from "./ViewPort/DebugPlay";
import { UINavigation } from "./Hierarchy/UINavigation";
import { useTranslation } from "react-i18next";

export const NinjaEditor = () => {
  const editor = useContext(NinjaEditorContext);
  const [viewSelect, setViewSelect] = useState<"mainview" | "debugplay" | "terrainmaker" | "playereditor" | "scripteditor" | "shadereditor">("mainview");
  
  const [scriptPath, setScriptPath] = useState<string>();
  const { t, i18n } = useTranslation();

  const changeView = (viewType: "mainview" |"debugplay" | "terrainmaker" | "playereditor" | "scripteditor" | "shadereditor") => {
    if (viewSelect !== viewType) {
      setViewSelect(viewType);
    }
  }


  /**
   * 新しいオブジェクトを追加する
   */
  const onClickNewObject = async () => {
    const data = await showSelectNewObjectDialog();
    if (data.type == "light"){
      editor.setObjectManagement(
        {
          id: generateUUID(),
          name: `*${data.value}`,
          type: "light",
          args: {
            type: data.value
          },
          physics: "none",
          visiableType: "auto",
        }
      )
    }
    else if (data.type == "sky"){
      editor.setObjectManagement(
        {
          id: generateUUID(),
          name: `*${data.value}`,
          type: "sky",
          args: {
            type: data.value
          },
          physics: "none",
          visiableType: "auto",
        }
      )
    }
    else if (data.type == "sound"){
      editor.setObjectManagement(
        {
          id: generateUUID(),
          name: `*${data.value}`,
          type: "sky",
          args: {
            type: data.value
          },
          physics: "none",
          visiableType: "auto",
        }
      )
    }
  }

  /**
   * 言語選択
   */
  const onClickSelectLang = () => {
    if (i18n.language == "ja"){
      i18n.changeLanguage("en");
    }
    else if (i18n.language == "en"){
      i18n.changeLanguage("ja");
    }
  }

  /**
   * テンプレート選択
   */
  const onClickSelectTemplate = () => {
    Swal.fire("注意", "現在ゲームテンプレートの準備中です。");
  }

  /**
   * プレイモードと編集モードの切り替え
   */
  const onPlayStop = () => {
    if (viewSelect == "debugplay"){
      setViewSelect("mainview");
    }
    else {
      setViewSelect("debugplay");
    }
  }

  /**
   * JSScriptで特定のスクリプトを開く
   */
  const changeScriptEditor = (scriptPath: string) => {
    setScriptPath(scriptPath);
    setViewSelect("scripteditor");
  }

  /**
   * プロジェクト全体を保存
   */
  const onSave = () => {
    toast(t("completeSave"), {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  }

  return (
    <>
      <div className={styles.editor}>
        <div className={styles.appBar}>
          <ul className={styles.nav}>
            <li className={`${styles.navItem} ${styles.left}`}>
              <a onClick={() => onClickSelectLang()}>{t("lang")}</a>
            </li>
            <li className={`${styles.navItem} ${styles.left}`}>
              <a onClick={() => window.open("https://github.com/foasho/NinjaGL", "_blank")}>
                Github
              </a>
            </li>
            <li className={`${styles.navItem} ${styles.left}`}>
              <a onClick={() => onClickSelectTemplate()}>{t("template")}</a>
            </li>
            <li className={`${styles.navCenter}`}>
              <a className={styles.item}>
                NinjaGL
              </a>
            </li>
            <li className={`${styles.navItem} ${styles.right}`}>
              <a className={styles.save} onClick={() => onSave()}>
                <span className={styles.icon}>
                  <AiFillSave />
                </span>
                Save
              </a>
            </li>
            <li className={`${styles.navItem} ${styles.right}`}>
              <a className={styles.play} onClick={() => onPlayStop()}>
                <span className={styles.icon}>
                  {viewSelect == "debugplay"? <><BsStop /></>: <><BsPlay /></>}
                </span>
                  {viewSelect == "debugplay"? <>Stop</>: <>Play</>}
                
              </a>
            </li>
          </ul>
        </div>
        <div className={styles.mainContents}>
          <div className={styles.hierarchy}>
            <div className={styles.hierarchyArea}>
              <div className={styles.hierarchyTree}>
                <HierarchyTree />
              </div>
            </div>
            <div className={styles.uiNavArea}>
              <div className={styles.uiNav}>
                <UINavigation />
              </div>
            </div>
            <div className={styles.contentsbrowser}>
              <ContentsBrowser changeScriptEditor={changeScriptEditor} />
            </div>
            <div className={styles.createObj}>
              <div className={styles.title}>
                <span className={styles.icon}>
                  <AiOutlinePlus />
                </span>
                <span className={styles.name} onClick={() => onClickNewObject()}>
                  {t("newObject")}
                </span>
              </div>
            </div>
          </div>
          <div className={styles.contents}>
            <div className={styles.viewselect}>
              <div className={styles.select}>
                <a
                  onClick={() => changeView("mainview")}
                  style={viewSelect == "mainview" ? { background: '#fff', color: "#838383" } : {}}
                >
                  {t("mainView")}
                </a>
                <a
                  onClick={() => changeView("debugplay")}
                  style={viewSelect == "debugplay" ? { background: '#fff', color: "#838383" } : {}}
                >
                  {t("debugPlay")}
                </a>
                <a
                  onClick={() => changeView("terrainmaker")}
                  style={viewSelect == "terrainmaker" ? { background: '#fff', color: "#838383" } : {}}
                >
                  {t("terrainMaker")}
                </a>
                <a
                  onClick={() => changeView("playereditor")}
                  style={viewSelect == "playereditor" ? { background: '#fff', color: "#838383" } : {}}
                >
                 {t("playerEditor")}
                </a>
                <a
                  onClick={() => changeView("scripteditor")}
                  style={viewSelect == "scripteditor" ? { background: '#fff', color: "#838383" } : {}}
                >
                  {t("scriptEditor")}
                </a>
                <a
                  onClick={() => changeView("shadereditor")}
                  style={viewSelect == "shadereditor" ? { background: '#fff', color: "#838383" } : {}}
                >
                  {t("shaderEditor")}
                </a>
              </div>
            </div>
            <div className={styles.viewport}>
              <div style={{ display: viewSelect == "mainview" ? "block": "none", height: "100%" }}>
                <MainViewer />
              </div>
              {viewSelect == "debugplay" &&
                <>
                  <DebugPlay />
                </>
              }
              {viewSelect == "terrainmaker" &&
                <>
                  <TerrainMaker />
                </>
              }
              {viewSelect == "playereditor" &&
                <>
                  <PlayerEditor />
                </>
              }
              {viewSelect == "scripteditor" &&
                <>
                  <ScriptEditor scriptPath={scriptPath} onChangeScriptPath={changeScriptEditor}/>
                </>
              }
              {viewSelect == "shadereditor" &&
                <>
                  <ShaderEditor />
                </>
              }
            </div>

          </div>
          <div className={styles.inspector}>
            {viewSelect == "mainview" &&
              <>
                <MainViewInspector />
              </>
            }
            {viewSelect == "scripteditor" &&
              <>
              </>
            }
            {viewSelect == "terrainmaker" &&
              <>
                <TerrainInspector />
              </>
            }
            {viewSelect == "playereditor" &&
              <>
                <PlayerInspector/>
              </>
            }
          </div>
        </div>
        <div className={styles.userScript}>

        </div>
        <div id="myDialog"></div>
      </div>
    </>
  )
}