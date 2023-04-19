import "./Locale";
import styles from "@/App.module.scss";
import { PlayerEditor } from "@/editor/ViewPort/PlayerEditor";
import { MainViewer } from "@/editor/ViewPort/MainViewer";
import { NinjaEditorContext, NinjaEditorManager } from "@/editor/NinjaEditorManager";
import { useState, useEffect, useContext, useRef, createContext } from "react";
import { Euler, MathUtils, Vector3 } from "three";
import { ContentsBrowser, ContentViewer } from "./Hierarchy/ContentViewer";
import { ScriptEditor } from "./ViewPort/ScriptEditor";
import { AiFillHome, AiFillSave, AiOutlineAppstore, AiOutlineCode, AiOutlineHighlight, AiOutlinePicture, AiOutlinePlus } from "react-icons/ai";
import { TerrainMakerCanvas } from "./ViewPort/TerrainMaker";
import { saveAs } from "file-saver";
import { MainViewInspector } from "./Inspector/MainViewInspector";
import { HierarchyTree } from "./Hierarchy/HierarchyTree";
import { BsCheck, BsPerson, BsPlay, BsStop } from "react-icons/bs";
import Swal from "sweetalert2";
import { showSelectNewObjectDialog } from "./Dialogs/SelectNewObjectDialog";
import { PlayerInspector } from "./Inspector/PlayerInspector";
import { ShaderEditor } from "./ViewPort/ShaderEditor";
import { DebugPlay } from "./ViewPort/DebugPlay";
import { UINavigation } from "./Hierarchy/UINavigation";
import { useTranslation } from "react-i18next";
import { loadNJCFileFromURL, NJCFile, saveNJCBlob, saveNJCFile } from "ninja-core";
import { loadNJCFile } from "ninja-core";
import { BiEditAlt } from "react-icons/bi";
import { useSnapshot } from "valtio";
import { globalStore } from "./Store";
import { ScriptNavigation } from "./Hierarchy/ScriptNavigation";
import { ShaderNavigation } from "./Hierarchy/ShaderNavigation";
import { TextureNavigation } from "./Hierarchy/TextureNavigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { showHelperDialog } from "./Dialogs/HelperDialog";
import { b64EncodeUnicode } from "@/commons/functional";

/**
 * NinjaEngineメインコンポネント
 */
export const NinjaEditor = () => {
  const { data: session } = useSession();
  const state = useSnapshot(globalStore);
  const editor = useContext(NinjaEditorContext);
  const [project, setProject] = useState<{name: string; path: string}>();
  const [viewSelect, setViewSelect] = useState<"mainview" | "debugplay" | "terrainmaker" | "playereditor" | "scripteditor" | "shadereditor">("mainview");
  const [selectSubNav, setSelectSubNav] = useState<"ui" | "shader" | "script" | "texture">("ui");
  const [showFileMenu, setShowFileMenu] = useState<boolean>(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [recentProgects, setRecentProjects] = useState<{name: string; path: string}[]>([]);
  const [autoSave, setAutoSave] = useState<boolean>(false);
  const { t, i18n } = useTranslation();

  /**
   * ビューポートの切り替え
   */
  const changeView = (viewType: "mainview" |"debugplay" | "terrainmaker" | "playereditor" | "scripteditor" | "shadereditor") => {
    if (viewSelect !== viewType) {
      globalStore.init();
      setViewSelect(viewType);
      if (viewType == "scripteditor"){
        setSelectSubNav("script");
      }
      else if (viewType == "shadereditor"){
        setSelectSubNav("shader");
      }
    }
  }

  /**
   * 新しいオブジェクトを追加する
   */
  const onClickNewObject = async () => {
    const data = await showSelectNewObjectDialog();
    if (data.type == "light"){
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: `*${data.value}`,
          type: "light",
          args: {
            type: data.value,
            castShadow: true,
            receiveShadow: false,
          },
          physics: "none",
          visibleType: "auto",
        }
      )
    }
    else if (data.type == "sky"){
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: `*${data.value}`,
          type: "sky",
          args: {
            type: data.value
          },
          physics: "none",
          visibleType: "auto",
        }
      )
    }
    else if (data.type == "sound"){
      // editor.setObjectManagement(
      //   {
      //     id: generateUUID(),
      //     name: `*${data.value}`,
      //     type: "sound",
      //     args: {
      //       type: data.value
      //     },
      //     physics: "none",
      //     visibleType: "auto",
      //   }
      // )
    }
    else if (data.type == "three"){
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: `*${data.value}`,
          type: "three",
          args: {
            type: data.value
          },
          physics: "none",
          visibleType: "auto",
        }
      );
    }
    else if (data.type == "camera"){
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: `*${data.value}`,
          type: "camera",
          args: {
            type: data.value,
            position: new Vector3(-3, 3, -6),
          },
          physics: "none",
          visibleType: "auto",
        }
      )
    }
    else if (data.type == "fog"){
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: `*${data.value}`,
          type: "fog",
          args: {
            type: data.value
          },
          physics: "none",
          visibleType: "auto",
        }
      )
    }
    else if (data.type == "environment"){
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: `*${data.value}`,
          type: "environment",
          args: {
            preset: data.value,
          },
          physics: "none",
          visibleType: "force",
        }
      );
    }
    else if (data.type == "lightformer"){
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: `*LF-(${data.value})`,
          type: "lightformer",
          args: {
            form: data.value,
            color: "#ffffff",
            intensity: 1,
            position: new Vector3(0, 1, 0),
          },
          physics: "none",
          visibleType: "force",
        }
      );
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
    Swal.fire(
      t("attention").toString(), 
      t("templatePrepare").toString()
    );
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
  const changeScriptEditor = () => {
    setViewSelect("scripteditor");
    setSelectSubNav("script");
  }

  /**
   * プロジェクトの変更
   */
  const changeProject = async (njcUrl: string, name: string) => {
    Swal.fire({
      title: 'Change Project?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      denyButtonText: `Close`,
    }).then(async (result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        const njcFile = await loadNJCFileFromURL(njcUrl);
        console.log("### ロードしたnjcFileを確認 ###");
        console.log(njcFile);
        editor.setNJCFile(njcFile);
        setProject({...project, name: name});
      }
    })
  }

  /**
   * プロジェクト名を保存
   */
  const changeProjectName = () => {
    Swal.fire({
      title: t("changeProjectName").toString(),
      input: 'text',
      showCancelButton: true,
      confirmButtonText: t("change").toString(),
      showLoaderOnConfirm: true,
      preConfirm: async (inputStr) => {
        if (inputStr.length === 0) {
          return Swal.showValidationMessage(t("leastInput"));
        }
        return inputStr;
      },
      allowOutsideClick: function () {
        return !Swal.isLoading();
      }
    }).then((result) => {
      if (result.value) {
        setProject({...project, name: result.value});
      }
    });
  };

  /**
   * プロジェクト全体を保存
   * ビルド処理
   */
  const onSave = async(completeAlert: boolean=true) => {
    const njcFile = new NJCFile();
    editor.getOMs().map((om) => {
      njcFile.addOM({...om});
    });
    editor.getUMs().map((um) => {
      njcFile.addUM({...um});
    });
    editor.getSMs().map((sm) => {
      njcFile.addSM({...sm});
    });
    const blob = await saveNJCBlob(njcFile);
    if (!project){
      Swal.fire({
        title: t("inputProjectName").toString(),
        input: 'text',
        showCancelButton: true,
        confirmButtonText: t("change").toString(),
        showLoaderOnConfirm: true,
        preConfirm: async (inputStr: string) => {
          //バリデーションを入れたりしても良い
          if (inputStr.length == 0) {
            return Swal.showValidationMessage(t("leastInput"));
          }
          return inputStr;
        },
        allowOutsideClick: function () {
          return !Swal.isLoading();
        }
      }).then(async (result) => {
        if (result.value) {
          // もしログインしているのならクラウドに保存する
          if (session){
            const formData = new FormData();
            formData.append("file", blob);
            const uploadPath = `users/${b64EncodeUnicode(session.user.email)}/savedata`;
            const keyPath = (uploadPath + `/${result.value}.njc`).replaceAll("//", "/");
            formData.append("filePath", keyPath);
            try {
              const response = await fetch("/api/storage/upload", {
                method: "POST",
                body: formData,
              });
              if (!response.ok) {
                throw new Error("Error uploading file");
              }
              const res = await response.json();
              // 成功したら、ローカルストレージの追加しておく
              localStorage.setItem(
                "recentprojects", 
                JSON.stringify([...JSON.parse(localStorage.getItem("recentprojects") || "[]"), {name: result.value, path: keyPath}])
              );
              setProject({name: result.value, path: keyPath});
              // Success message
              if (completeAlert){
                Swal.fire({
                  icon: 'success',
                  title: t("success"),
                  text: t("saveSuccess") + `\npersonal/savedata/${result.value}.njc`,
                });
              }
            } catch (error) {
              console.error("Error:", error.message);
              // 失敗したらをローカルに保存
              saveAs(blob, `${result.value}.njc`);
              setProject({name: result.value, path: undefined});
            }
          }
          else {
            // ZIPファイルをローカルに保存
            saveAs(blob, `${result.value}.njc`);
            setProject({name: result.value, path: undefined});
          }
        }
      });
    }
    else {
      saveAs(blob, `${project.name}.njc`);
    }
  }

  /**
   * ファイルメニューを開く
   */
  const openFileMenu = () => {
    setShowFileMenu(!showFileMenu);
  }
  const handleFileMenuLeave = () => {
    setShowFileMenu(false);
  };
  const handleRecentProjectsHover = () => {
    setShowSubMenu(true);
  };
  const handleSubMenuMouseLeave = () => {
    setShowSubMenu(false);
  };

  /**
   * プロジェクトを開く
   */
  const openProject = async () => {
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = '.njc'; // NJCの拡張子を指定
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      if (files && files.length > 0){
        const file = (target.files as FileList)[0];
        const njcFile = await loadNJCFile(file);
        console.log("### ロードしたnjcFileを確認 ###");
        console.log(njcFile);
        editor.setNJCFile(njcFile);
      }
    };
    input.click();
  }

  /**
   * プロジェクトが何もないときは、
   * BoxとPlane, DirectionalLight, SpotLightを追加
   * Environment(Sunset)を追加
   */
  useEffect(() => {
    if (editor.getOMs().length == 0){
      // Box
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: "movebox",
          type: "three",
          args: {
            type: "box",
            position: new Vector3(0, .5, 0),
            materialData: {
              type: "phong",
              value: "#137dcf",
            },
            castShadow: true,
          },
          physics: "none",
          visibleType: "auto",
        }
      );
      // DirectionalLight
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: "Directional1",
          type: "light",
          args: {
            type: "directional",
            position: new Vector3(14, 7, 8),
            materialData: {
              type: "standard",
              value: "#e3dfcc",
            },
            intensity: 1,
            castShadow: true,
          },
          physics: "none",
          visibleType: "auto",
        }
      );
      // SpotLight
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: "Spot1",
          type: "light",
          args: {
            type: "spot",
            position: new Vector3(-6, 10, -22),
            materialData: {
              type: "standard",
              value: "#FDF1D9",
            },
            intensity: 1,
            castShadow: true,
            receiveShadow: true,
          },
          physics: "none",
          visibleType: "auto",
        }
      );
      // Plane
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: "Plane",
          type: "three",
          args: {
            type: "plane",
            position: new Vector3(0, 0, 0),
            rotation: new Euler(-Math.PI / 2, 0, 0),
            scale: new Vector3(32, 32, 32),
            materialData: {
              type: "reflection",
              value: "#111212",
            },
            castShadow: true,
            receiveShadow: true,
          },
          physics: "none",
          visibleType: "auto",
        }
      );
      // Environment
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: "Environment",
          type: "environment",
          args: {
            preset: "sunset",
            blur: 0.7,
            background: true,
          },
          physics: "none",
          visibleType: "force",
        }
      );
      // LightFormer追加
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: "*LF (rect)",
          type: "lightformer",
          args: {
            form: "rect",
            color: "#ffeb38",
            intensity: 1,
            position: new Vector3(-5, 5, -5),
            scale: new Vector3(3, 3, 3),
            lookAt: new Vector3(0, 0, 0),
          },
          physics: "none",
          visibleType: "force",
        }
      );
      editor.setOM(
        {
          id: MathUtils.generateUUID(),
          name: "*LF (ring)",
          type: "lightformer",
          args: {
            form: "ring",
            color: "#e60b0b",
            intensity: 10,
            position: new Vector3(10, 5, 10),
            scale: new Vector3(3, 3, 3),
            lookAt: new Vector3(0, 0, 0),
          },
          physics: "none",
          visibleType: "force",
        }
      );
    }
    // 最近開いたプロジェクトを取得
    const recentProjects = localStorage.getItem("recentProjects");
    if (recentProjects){
      setRecentProjects(JSON.parse(recentProjects));
    }
    // AutoSaveが有効かどうかを取得
    const autoSave = localStorage.getItem("autoSave");
    if (autoSave){
      setAutoSave(autoSave == "true");
    }
  }
  , []);

  useEffect(() => {
    // AutoSaveが有効なら、AutoSaveを開始
    let autoSaveInterval;
    if (autoSave && session){
      autoSaveInterval = setInterval(() => {
        onSave();
      }, 900 * 1000);
    }
    return () => {
      clearInterval(autoSaveInterval);
    }
  }, [autoSave]);


  return (
    <>
      <div className={styles.editor}>
        <div className={styles.appBar}>
          <ul className={styles.nav}>
            <li className={`${styles.navItem} ${styles.left}`}>
              <a onClick={() => openFileMenu()}>{t("file")}</a>
            </li>
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
              <a className={styles.projectName} onClick={() => {changeProjectName()}}>
                {project? project.name: <><BiEditAlt/>{t("nontitle")}</>}
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
            <li className={`${styles.navItem} ${styles.right}`}>
              <Link className={styles.isLoggedIn} href={"/login"}>
                <span className={styles.icon}>
                  {(session)? <><BsPerson /></>: <>LogIn</>}
                </span>
              </Link>
            </li>
          </ul>
          {showFileMenu &&
          <div className={styles.filemenu}>
            <ul onMouseLeave={() => handleFileMenuLeave()}>
              {/* <li><a>{t("newProject")}</a></li> ##WEBなので不要?  */}
              <li><a onClick={() => openProject()}>{t("open")}</a></li>
              <li onMouseEnter={() => handleRecentProjectsHover()} onMouseLeave={() => handleSubMenuMouseLeave()}>
                <a>{t("recentProjects")}</a>
                {showSubMenu &&
                <ul className={styles.subMenu} onMouseLeave={() => handleSubMenuMouseLeave()}>
                  {recentProgects.map(((pf, idx) => {
                    return (
                      <li key={idx}>
                        <a>{pf.name}</a>
                        <a>{pf.path}</a>
                      </li>
                    )
                  }))}
                  {recentProgects.length == 0 && 
                    <li>
                      <a>{t("noRecentData")}</a>
                    </li>
                  }
                </ul>
                }
              </li>
              <li>
                <a onClick={() => setAutoSave(!autoSave)} >
                  {autoSave?
                    <BsCheck/>
                    :
                    <> </>
                  }
                  {t("autoSave")}
                </a>
              </li>
              <li><a onClick={() => showHelperDialog()}>{t("help")}</a></li>
            </ul>
          </div>
          }
        </div>
        <div className={styles.mainContents}>
          <div className={styles.hierarchy}>
            <div className={styles.hierarchyArea}>
              <div className={styles.hierarchyTree}>
                <HierarchyTree />
              </div>
            </div>
            <div className={styles.subNavArea}>
              <div className={styles.subSelect}>
                <div className={`${styles.navItem} ${selectSubNav == "ui" && styles.active}`} onClick={() => setSelectSubNav("ui")}>
                  <span className={styles.icon}>
                    <AiOutlineAppstore />
                  </span>
                </div>
                <div className={`${styles.navItem} ${selectSubNav == "script" && styles.active}`} onClick={() => setSelectSubNav("script")}>
                  <span className={styles.icon}>
                    <AiOutlineCode />
                  </span>
                </div>
                <div className={`${styles.navItem} ${selectSubNav == "shader" && styles.active}`} onClick={() => setSelectSubNav("shader")}>
                  <span className={styles.icon}>
                    <AiOutlineHighlight />
                  </span>
                </div>
                <div className={`${styles.navItem} ${selectSubNav == "texture" && styles.active}`} onClick={() => setSelectSubNav("texture")}>
                  <span className={styles.icon}>
                    <AiOutlinePicture />
                  </span>
                </div>
              </div>
              <div className={styles.subNav}>
                {selectSubNav == "ui" &&
                  <UINavigation />
                }
                {selectSubNav == "script" &&
                  <ScriptNavigation/>
                }
                {selectSubNav == "shader" &&
                  <ShaderNavigation/>
                }
                {selectSubNav == "texture" &&
                  <TextureNavigation/>
                }
              </div>
            </div>
            <div className={styles.contentsbrowser}>
              <ContentsBrowser 
                changeScriptEditor={changeScriptEditor}
                changeProject={changeProject}
              />
            </div>
            <div className={styles.createObj} onClick={() => onClickNewObject()}>
              <div className={styles.title}>
                <span className={styles.icon}>
                  <AiOutlinePlus />
                </span>
                <span className={styles.name}>
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
              {viewSelect == "mainview" &&
               <>
                <MainViewer />
               </>
              }
              {viewSelect == "debugplay" &&
                <>
                  <DebugPlay />
                </>
              }
              {viewSelect == "terrainmaker" &&
                <>
                  <TerrainMakerCanvas />
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
          <div 
            className={styles.inspector}
            style={{
              display: (
                (viewSelect == "mainview" && state.currentId)
                ||
                (viewSelect == "terrainmaker")
                ||
                (viewSelect == "playereditor")
              )?"block": "none",
            }}
          >
            {(viewSelect == "mainview") &&
              <>
                <MainViewInspector />
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