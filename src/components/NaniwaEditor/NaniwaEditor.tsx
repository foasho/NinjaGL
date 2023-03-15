import styles from "@/App.module.scss";
import { GLTFViewer } from "@/components/NaniwaEditor/ViewPort/GLTFViewer";
import { MainViewer } from "@/components/NaniwaEditor/ViewPort/MainViewer";
import { NaniwaEditorContext, NaniwaEditorManager } from "@/components/NaniwaEditor/NaniwaEditorManager";
import { useState, useEffect, useContext, useRef } from "react";
import { Object3D, Vector3 } from "three";
import { reqApi } from "@/services/ServciceApi";
import { ContentViewer } from "./Inspector/ContentViewer";
import { PivotControls } from "@react-three/drei";
import { IObjectManagement } from "@/engine/core/NaniwaProps";
import { ScriptEditor } from "./ViewPort/ScriptEditor";
import { AiFillHome, AiFillSave, AiOutlinePlus } from "react-icons/ai";
import { TerrainMaker } from "./ViewPort/TerrainMaker";
import { TerrainInspector } from "./Inspector/TerrainInspector";
import { MainViewInspector } from "./Inspector/MainViewInspector";
import { HierarchyTree } from "./Hierarchy/HierarchyTree";
import { BsPlay } from "react-icons/bs";
import Swal from "sweetalert2";
import { showSelectNewObjectDialog } from "./Dialogs/SelectNewObjectDialog";

export interface IFileProps {
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  onDoubleClick?: (type: string, value: string) => void;
}

export const NaniwaEditor = () => {
  const editor = useContext(NaniwaEditorContext);
  const [viewSelect, setViewSelect] = useState<"mainview" | "terrainmaker" | "gltfviewer" | "scripteditor" | "shadereditor">("mainview");
  const [files, setFiles] = useState<IFileProps[]>([]);
  const [position, setPosition] = useState<Vector3>(new Vector3(0, 0, 0));
  const [oms, setOMs] = useState<IObjectManagement[]>([]);
  const [selectOMs, setSelectOMs] = useState<IObjectManagement[]>([]);

  const changeView = (viewType: "mainview" | "terrainmaker" | "gltfviewer" | "scripteditor" | "shadereditor") => {
    if (viewSelect !== viewType) {
      setViewSelect(viewType);
    }
  }

  const changePosition = (e, xyz: "x" | "y" | "z") => {
    // if (editor.selectObject){
    //     const newPosition = new Vector3().copy(editor.position);
    //     if (xyz == "x"){
    //         newPosition.setX(Number(e.target.value));
    //     }
    //     else if (xyz == "y"){
    //         newPosition.setY(Number(e.target.value));
    //     }
    //     else if (xyz == "z") {
    //         newPosition.setZ(Number(e.target.value));
    //     }
    //     editor.position.copy(newPosition);
    // }
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
    console.log(data);
    // ここに光源を追加する処理をかく
    // 流れ: oms.push -> MainView内のLightsを追加し、oms.lengthを監視
  }

  const onClickSelectLang = () => {
    Swal.fire("注意", "現在は日本語のみ対応です。\nCurrently, we only support Japanese.");
  }

  const onClickSelectTemplate = () => {
    Swal.fire("注意", "現在ゲームテンプレートの準備中です。");
  }

  useEffect(() => {
    const interval = setInterval(() => {
      myFrame();
    }, 1000 / 10);
    return () => clearInterval(interval);
  }, [selectOMs.length, oms.length])

  const myFrame = () => {
    const _selectOMs = editor.getSelectObjects();
    if (selectOMs.length !== _selectOMs.length) {
      setSelectOMs(_selectOMs);
    }
    const OMs = editor.oms;
    if (oms.length !== OMs.length) {
      setOMs(OMs);
    }
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
              <a className={styles.save}>
                <span className={styles.icon}>
                  <AiFillSave />
                </span>
                Save
              </a>
            </li>
            <li className={`${styles.navItem} ${styles.right}`}>
              <a className={styles.play}>
                <span className={styles.icon}>
                  <BsPlay />
                </span>
                Play
              </a>
            </li>
          </ul>
        </div>
        <div className={styles.mainContents}>
          <div className={styles.hierarchy}>
            <div className={styles.hierarchyArea}>
              <div className={styles.hierarchyTree}>
                <HierarchyTree oms={oms} />
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
                  onClick={() => changeView("terrainmaker")}
                  style={viewSelect == "terrainmaker" ? { background: '#fff', color: "#838383" } : {}}
                >
                  地形メーカー
                </a>
                <a
                  onClick={() => changeView("gltfviewer")}
                  style={viewSelect == "gltfviewer" ? { background: '#fff', color: "#838383" } : {}}
                >
                  GLTFビューア
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
              {viewSelect == "mainview" &&
                <>
                  <MainViewer />
                </>
              }
              {viewSelect == "terrainmaker" &&
                <>
                  <TerrainMaker />
                </>
              }
              {viewSelect == "gltfviewer" &&
                <>
                  <GLTFViewer />
                </>
              }
              {viewSelect == "scripteditor" &&
                <>
                  <ScriptEditor />
                </>
              }
              {viewSelect == "shadereditor" &&
                <>
                </>
              }
            </div>

          </div>
          <div className={styles.inspector}>
            {viewSelect == "mainview" &&
              <>
                {selectOMs.map((om) => {
                  return <MainViewInspector om={om} />
                })}
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
          </div>
        </div>
        <div id="myDialog"></div>
      </div>
    </>
  )
}