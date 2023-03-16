import styles from "@/App.module.scss";
import { PlayerEditor } from "@/components/NaniwaEditor/ViewPort/PlayerEditor";
import { MainViewer } from "@/components/NaniwaEditor/ViewPort/MainViewer";
import { NaniwaEditorContext, NaniwaEditorManager } from "@/components/NaniwaEditor/NaniwaEditorManager";
import { useState, useEffect, useContext, useRef } from "react";
import { Object3D, Vector3 } from "three";
import { reqApi } from "@/services/ServciceApi";
import { ContentViewer } from "./Hierarchy/ContentViewer";
import { PivotControls } from "@react-three/drei";
import { IObjectManagement } from "@/engine/Core/NaniwaProps";
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

export interface IFileProps {
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  onDoubleClick?: (type: string, value: string) => void;
}

export const NaniwaEditor = () => {
  const editor = useContext(NaniwaEditorContext);
  const [viewSelect, setViewSelect] = useState<"mainview" | "debugplay" | "terrainmaker" | "playereditor" | "scripteditor" | "shadereditor">("mainview");
  const [files, setFiles] = useState<IFileProps[]>([]);

  const changeView = (viewType: "mainview" |"debugplay" | "terrainmaker" | "playereditor" | "scripteditor" | "shadereditor") => {
    if (viewSelect !== viewType) {
      setViewSelect(viewType);
    }
  }

  useEffect(() => {
    // アセットをロードする
    reqApi({ route: "filesize", queryObject: { routePath: "/" } }).then((res) => {
      if (res.status == 200) {
        setFiles(res.data.files);
      }
    })
  }, []);

  const onDoubleClick = (type: "directory" | "gltf" | "js", path: string) => {
    if (type == "directory") {
      reqApi({ route: "filesize", queryObject: { routePath: path } }).then((res) => {
        if (res.status == 200) {
          editor.assetRoute = (path != "/") ? path : "";
          setFiles(res.data.files);
        }
      })
    }
  }

  const onMoveDic = (value: string) => {
    const routes = editor.assetRoute.split("/");
    let path = "";
    if (value.length > 0) {
      for (const route of routes) {
        if (route.length > 0) {
          path += `/${route}`;
          if (route == value) {
            break;
          }
        }
      }
    }
    else {
      path = "/";
    }
    reqApi({ route: "filesize", queryObject: { routePath: path } }).then((res) => {
      if (res.status == 200) {
        editor.assetRoute = (path != "/") ? path : "";
        setFiles(res.data.files);
      }
    })
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

  const onClickSelectLang = () => {
    Swal.fire("注意", "現在は日本語のみ対応です。\nCurrently, we only support Japanese.");
  }

  const onClickSelectTemplate = () => {
    Swal.fire("注意", "現在ゲームテンプレートの準備中です。");
  }

  const onPlayStop = () => {
    if (viewSelect == "debugplay"){
      setViewSelect("mainview");
    }
    else {
      setViewSelect("debugplay");
    }
  }

  const onSave = () => {
    toast('保存しました!!', {
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
              <a onClick={() => onClickSelectLang()}>言語(JP)</a>
            </li>
            <li className={`${styles.navItem} ${styles.left}`}>
              <a onClick={() => window.open("https://github.com/foasho/naniwajs", "_blank")}>
                Github
              </a>
            </li>
            <li className={`${styles.navItem} ${styles.left}`}>
              <a onClick={() => onClickSelectTemplate()}>テンプレート</a>
            </li>
            <li className={`${styles.navCenter}`}>
              <a className={styles.item}>
                NaniwaJS
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
            <div className={styles.contentsbrowser}>
              <div className={styles.pathName}>
                <div className={styles.title}>
                  コンテンツブラウザ
                  <span className={styles.home} onClick={() => onMoveDic("")}>
                    <AiFillHome />
                  </span>
                </div>
                {editor.assetRoute.split("/").map((route) => {
                  if (route.length == 0) {
                    return <></>
                  }
                  return (
                    <span className={styles.route} onClick={() => onMoveDic(route)}>
                      /{route}
                    </span>
                  )
                })}
              </div>
              <div className={styles.itemContainer}>
                {files.map((file) => {
                  return (
                    <ContentViewer {...file} onDoubleClick={onDoubleClick} />
                  )
                })}
              </div>
            </div>
            <div className={styles.createObj}>
              <div className={styles.title}>
                <span className={styles.icon}>
                  <AiOutlinePlus />
                </span>
                <span className={styles.name} onClick={() => onClickNewObject()}>
                  新しいオブジェクト
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
                  メインビュー
                </a>
                <a
                  onClick={() => changeView("debugplay")}
                  style={viewSelect == "debugplay" ? { background: '#fff', color: "#838383" } : {}}
                >
                  プレイビュー
                </a>
                <a
                  onClick={() => changeView("terrainmaker")}
                  style={viewSelect == "terrainmaker" ? { background: '#fff', color: "#838383" } : {}}
                >
                  地形メーカー
                </a>
                <a
                  onClick={() => changeView("playereditor")}
                  style={viewSelect == "playereditor" ? { background: '#fff', color: "#838383" } : {}}
                >
                  プレイヤービュー
                </a>
                <a
                  onClick={() => changeView("scripteditor")}
                  style={viewSelect == "scripteditor" ? { background: '#fff', color: "#838383" } : {}}
                >
                  スクリプトエディタ
                </a>
                <a
                  onClick={() => changeView("shadereditor")}
                  style={viewSelect == "shadereditor" ? { background: '#fff', color: "#838383" } : {}}
                >
                  シェーダーエディタ
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
                  <ScriptEditor />
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
        <div id="myDialog"></div>
      </div>
    </>
  )
}