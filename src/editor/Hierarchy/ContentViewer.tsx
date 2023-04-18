import styles from "@/App.module.scss";

import {
  BsFileImage,
  BsFolder
} from "react-icons/bs";
import { useContext, useEffect, useRef, useState } from "react";
import { reqApi } from "@/services/ServciceApi";
import { NinjaEditorContext } from "../NinjaEditorManager";
import { AmbientLight, DirectionalLight, LoadingManager, MathUtils, PerspectiveCamera, Scene, SpotLight, WebGLRenderer } from "three";
import { DRACOLoader, GLTFLoader, KTX2Loader } from "three-stdlib";
import { MeshoptDecoder } from "meshoptimizer";
import { useTranslation } from "react-i18next";
import { 
  AiFillHome, 
  AiOutlineCloudUpload, 
  AiOutlineDoubleLeft, 
  AiOutlineDoubleRight, 
  AiOutlineLeft, 
  AiOutlineRight,
  AiFillFolderOpen
} from "react-icons/ai";
import Swal from "sweetalert2";
import { InitScriptManagement } from "ninja-core";
import { useSnapshot } from "valtio";
import { globalContentStore, globalScriptStore } from "../Store";
import { useSession } from "next-auth/react";
import { AssetsContextMenu } from "../Dialogs/AssetsContextMenu";
import { b64EncodeUnicode } from "@/commons/functional";
import { MdUploadFile } from "react-icons/md";

export interface IFileProps {
  url: string;
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  changeScriptEditor: () => void;
  onDoubleClick?: (type: string, value: string) => void;
  imageUrl?: string;
}


const getExtension = (filename: string) => {
  if (filename === undefined) return "";
  return filename.split('.').pop().toLowerCase();
}

const isImage = (filename: string) => {
  const ext = getExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

const gltf_icon = "fileicons/gltf.png";
const object_icon = "fileicons/object.png";
const isGLTF = (filename: string) => {
  const ext = getExtension(filename);
  return ['glb', 'gltf'].includes(ext);
}

const mp3_icon = "fileicons/mp3.png";
const isMP3 = (filename: string) => {
  const ext = getExtension(filename);
  return ['mp3'].includes(ext);
}

const glsl_icon = "fileicons/glsl.png";
const isGLSL = (filename: string) => {
  const ext = getExtension(filename);
  return ['glsl'].includes(ext);
}

const js_icon = "fileicons/js.png";
const isJS = (filename: string) => {
  const ext = getExtension(filename);
  return ['js'].includes(ext);
}

const terrain_icon = "fileicons/terrain.png";
const isTerrain = (filename: string) => {
  const ext = getExtension(filename);
  return ['ter'].includes(ext);
}

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

interface IContentsBrowser {
  changeScriptEditor: () => void;
} 

/**
 * コンテンツブラウザ
 * @param props 
 * @returns 
 */
export const ContentsBrowser = (props: IContentsBrowser) => {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isPersonalDir, setIsPersonalDir] = useState(false);
  const [path, setPath] = useState("");
  const [offset, setOffset] = useState(0);
  const [maxPages, setMaxPages] = useState(1);
  const { t } = useTranslation();
  const [files, setFiles] = useState<IFileProps[]>([]);
  const loadRef = useRef<HTMLDivElement>();

  /**
   * GLTFの画像を取得する
   * @param url 
   * @param key 
   * @returns 
   */
  const getGLTFImage = async (url: string, key: string): Promise<string> => {
    if (isGLTF(key)){
      return await CreateGLTFImage(url);
    }
    return null
  }

  /**
   * 表示するファイルを移動
   */
  const MoveDirectory = async () => {
    loadRef.current.style.display = "block";
    let prefix = isPersonalDir ? `users/${b64EncodeUnicode(session.user.email)}/${path}`: path; 
    // 最初に/を削除
    if (prefix.charAt(0) == "/"){
      prefix = prefix.slice(1);
    }
    await reqApi({ route: "storage/list", queryObject: { 
      prefix: prefix.replaceAll("//", "/"), 
      offset: offset 
    } }).then(async (res) => {
      if (res.status == 200) {
        const files: IFileProps[] = [];
        const items = res.data.items;
        for (const item of items){
          const file: IFileProps = {
            url: item.signedUrl,
            size: item.Size,
            isFile: item.signedUrl ? true : false,
            isDirectory: item.signedUrl ? false : true,
            name: item.Key,
            changeScriptEditor: null,
          }
          if (file.isDirectory){
            file.url = path + "/" + file.name;
          }
          const imageUrl = await getGLTFImage(item.signedUrl, item.Key);
          if (imageUrl){
            file.imageUrl = imageUrl;
          }
          else {
            if (isGLTF(item.Key)){
              continue;
            }
          }
          files.push(file);
        }
        setFiles(files);
        if (res.data.maxPages){
          setMaxPages(res.data.maxPages);
        }
      }
    });
    loadRef.current.style.display = "none";
  }


  useEffect(() => {
    MoveDirectory();
    return () => {}
  }, [path, offset, isPersonalDir]);

  const onDoubleClick = (type: "directory" | "gltf" | "js", path: string) => {
    if (type == "directory" && path) {
      setPath(path.replaceAll("//", "/"));
    }
  }

  const changeOffset = (value: number) => {
    setOffset(value);
  }

  /**
   * パスを押して移動
   * @param value 
   */
  const onMoveDic = (value: string) => {
    const routes = path.split("/");
    let _path = "";
    if (value.length > 0) {
      for (const route of routes) {
        if (route.length == 0) {
          continue;
        }
        _path += route + "/";
        if (route == value) {
          break;
        }
      }
    }
    setPath(_path);
    setOffset(0);
  }


  /**
   * 右クリックメニューの表示
   * @param event 
   */
  const handleContextMenu = (event) => {
    event.preventDefault();
    setShowMenu(true);
    setMenuPosition({ x: event.clientX, y: event.clientY });
  };

  const handleClick = () => {
    setShowMenu(false);
  };

  /**
   * 任意のファイルをアップロード
   */
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0 && session) {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);
      let _path = path;
      const uploadPath = `users/${b64EncodeUnicode(session.user.email)}/${_path}`;
      const keyPath = (uploadPath + "/" + file.name).replaceAll("//", "/");
      formData.append("filePath", keyPath);
      try {
        const response = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Error uploading file");
        }
        const result = await response.json();
        MoveDirectory();//Directoryの更新
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  }
  const handleDragOver = (e) => {
    e.preventDefault(); // ブラウザのデフォルト動作をキャンセルする
  };

  return (
    <>
      <div 
        className={styles.pathName}
      >
        <div className={styles.title}>
          {t("contentsBrowser")}
          <span className={styles.home} onClick={() => {
            setIsPersonalDir(false);
            onMoveDic("");
          }}>
            <AiFillHome />
          </span>
        </div>
        {path.split("/").map((route, idx) => {
          if (route.length == 0) {
            return <></>
          }
          return (
            <span className={styles.route} onClick={() => onMoveDic(route)} key={idx}>
              /{route}
            </span>
          )
        })}
      </div>
      <div className={styles.itemContainer}>
        {files.map((file, index) => {
          return (
            <>
              <ContentViewer 
                {...file} 
                onDoubleClick={onDoubleClick}
                changeScriptEditor={props.changeScriptEditor}
                key={index}
              />
            </>
          )
        })}
        {(session && !isPersonalDir) && 
        <>
          <div
            className={styles.itemCard}
            onContextMenu={handleContextMenu} 
            onClick={handleClick}
            onMouseLeave={() => setShowMenu(false)}
            onDoubleClick={() => {
              setPath("");
              setOffset(0);
              setIsPersonalDir(true);
            }}
          >
            {showMenu && <AssetsContextMenu position={menuPosition} />}
            <div
              className={styles.icon}

            >
              <a className={styles.iconImg}>
                <AiFillFolderOpen />
              </a>
            </div>
            <div className={styles.itemName}>
              Personal
            </div>
          </div>
        </>
        }
        {isPersonalDir &&
        <>
          <div
            className={styles.uploadZone}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div
              className={styles.icon}
            >
              <a 
                className={styles.iconImg}
              >
                <MdUploadFile />
              </a>
            </div>
            <div className={styles.itemName}>
              Drag and Drop Here
            </div>
          </div>
        </>
        }
        <div className={styles.loader} ref={loadRef}>
          <div className={styles.now}>
            {t("nowLoading")}
          </div>
        </div>
      </div>
      <>
        {maxPages > 1 &&
          <div className={styles.pageContainer}>
            {offset > 0 &&
              <>
                <div className={`${styles.page} ${styles.first}`} onClick={() => changeOffset(0)}>
                  <AiOutlineDoubleLeft />
                </div>
                <div className={`${styles.page} ${styles.prev}`} onClick={() => changeOffset(offset - 1)}>
                  <AiOutlineLeft />
                </div>
              </>
            }
            <div className={styles.pageInfo}>
              {offset + 1} / {maxPages}
            </div>
            {offset + 1 < maxPages &&
              <>
                <div className={`${styles.page} ${styles.next}`} onClick={() => changeOffset(offset + 1)}>
                  <AiOutlineRight />
                </div>
                <div className={`${styles.page} ${styles.last}`} onClick={() => changeOffset(maxPages - 1)}>
                  <AiOutlineDoubleRight />
                </div>
              </>
            }
          </div>
        }
      </>
    </>
  )
}

interface IContenetViewerProps extends IFileProps {
}

export const ContentViewer = (props: IContenetViewerProps) => {
  let icon: JSX.Element;
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  let tooltipTimer: NodeJS.Timeout = null;
  let tooltipHideTimer: NodeJS.Timeout = null;
  let tooltip = useRef<HTMLDivElement>();
  const editor = useContext(NinjaEditorContext);
  const { t } = useTranslation();

  /**
 * 右クリックメニューの表示
 * @param event 
 */
  const handleContextMenu = (event) => {
    event.preventDefault();
    setShowMenu(true);
    setMenuPosition({ x: event.clientX, y: event.clientY });
  };

  const handleClick = () => {
    setShowMenu(false);
  };

  let contentsSelectType: "gltf" | "mp3" | "js" | "glsl" | "image" | "ter" | "avt" = null;
  if (props.isFile) {
    if (isImage(props.name)) {
      icon = (
        <>
          <img src={props.url} className={styles.iconImg} />
        </>
      )
      contentsSelectType = "image";
    }
    else if (isGLTF(props.name)) {
      icon = (
        <>
          <div className={styles.iconImg}>
            <img src={`${props.imageUrl}`} className={styles.iconImg} />
          </div>
        </>
      )
      contentsSelectType = "gltf";
    }
    else if (isMP3(props.name)) {
      icon = (
        <>
          <img src={mp3_icon} className={styles.iconImg} data-path={props.name} />
        </>
      )
      contentsSelectType = "mp3";
    }
    else if (isGLSL(props.name)) {
      icon = (
        <>
          <img src={glsl_icon} className={styles.iconImg} data-path={props.name} />
        </>
      )
      contentsSelectType = "glsl";
    }
    else if (isJS(props.name)) {
      icon = (
        <>
          <img src={js_icon} 
            className={styles.iconImg} 
            data-path={props.name} 
          />
        </>
      )
      contentsSelectType = "js";
    }
    else if (isTerrain(props.name)) {
      icon = (
        <>
          <img src={terrain_icon} className={styles.iconImg} data-path={props.name} />
        </>
      )
      contentsSelectType = "ter";
    }
    // どれにも該当しない場合は表示しない
    else {
      return (<></>)
    }
  }
  else if (props.isDirectory) {
    icon = (
      <a className={styles.iconImg}>
        <BsFolder />
      </a>
    )
  }

  const hideTooltip = () => {
    tooltip.current.style.display = "none";
  }

  const viewTooltip = () => {
    tooltip.current.style.display = "block";
    if (tooltipHideTimer) {
      clearTimeout(tooltipHideTimer);
    }
    tooltipHideTimer = setTimeout(hideTooltip, 2000);
  }

  const onHover = (e) => {
    if (icon) {
      if (props.isFile) {
        if (tooltipTimer) {
          clearTimeout(tooltipTimer)
        }
        tooltip.current.style.left = e.clientX;
        let top = e.clientY;
        tooltip.current.style.top = `${top + 10}px`;
        tooltipTimer = setTimeout(viewTooltip, 1500);
      }
    }
  }

  const onMouseOut = (e) => {
    if (tooltipTimer) {
      clearTimeout(tooltipTimer)
    }
    tooltip.current.style.display = "none";
  }

  const onDoubleClick = async (type: string) => {
    if (props.isDirectory) {
      if (props.onDoubleClick) {
        props.onDoubleClick("directory", props.url);
      }
    }
    else if (props.isFile && type == "js"){
      const sm = {...InitScriptManagement};
      sm.id = MathUtils.generateUUID();
      const scriptCheck = async () => {
        try {
          const response = await fetch(props.url);
          if (response.ok) {
            const text = await response.text();
            // 特定の文字列をチェックします。
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
        sm.name = props.name.split("/").pop() || "";
        const success = editor.setSM(sm);
        if (!success) {
          Swal.fire({
            title: t("scriptError"),
            text: t("scriptErrorAlreadyText"),
            icon: "error",
          });
        }
        else {
          globalScriptStore.currentSM = sm;
          props.changeScriptEditor();
        }
      }
      else {
        Swal.fire({
          title: t("scriptError"),
          text: t("scriptErrorText"),
          icon: "error",
        });
      }
    }
  }

  /**
   * ファイルを選択して追加
   */
  const onDragStart = () => {
    globalContentStore.currentType = contentsSelectType;
    globalContentStore.currentUrl = `${props.url}`;
  }
  const onDragEnd = () => {
    globalContentStore.currentType = null;
    globalContentStore.currentUrl = null;
  }

  return (
    <>
      <div
        onContextMenu={handleContextMenu} 
        onClick={handleClick}
        onDoubleClick={(e) => onDoubleClick(contentsSelectType)}
        className={styles.itemCard}
        onDragStart={(e) => onDragStart()}
        onDragEnd={(e) => onDragEnd()}
        onMouseLeave={() => setShowMenu(false)}
      >
        {showMenu && <AssetsContextMenu position={menuPosition} file={props} />}
        <div
          className={styles.tooltip}
          ref={tooltip}
        >
          <strong>{t("filename")}</strong><br />
          {props.name}
          <br />
          <strong>{t("size")}</strong><br />
          {formatBytes(props.size)}
        </div>
        <div
          className={styles.icon}
          onMouseOver={(e) => onHover(e)}
          onMouseOut={(e) => onMouseOut(e)}
        >
          {icon}
        </div>
        <div className={styles.itemName}>
          {props.name}
        </div>
      </div>
    </>
  )
}

const MANAGER = new LoadingManager();
const THREE_PATH = `https://unpkg.com/three@0.149.0`;
export const DRACO_LOADER = new DRACOLoader( MANAGER ).setDecoderPath(`${THREE_PATH}/examples/jsm/libs/draco/gltf/` );
export const KTX2_LOADER = new KTX2Loader( MANAGER ).setTranscoderPath( `${THREE_PATH}/examples/jsm/libs/basis/` );;

/**
 * 
 * @param gltfUrl 
 * @returns 
 */
const CreateGLTFImage = (gltfUrl): Promise<string> => {
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;

  // Making Scene
  const scene = new Scene();

  // Making Camera
  const camera = new PerspectiveCamera(
    45,
    1,
    0.1,
    1000
  );
  camera.position.set(0, 0, 2);

  // Making Renderer
  const cleanup = () => {
    if (renderer) {
      renderer.dispose();
    }
    if (scene) {
      scene.clear();
    }
    if (camera) {
      camera.clear();
    }
  };

  const renderer = new WebGLRenderer({ 
    canvas: canvas,
    alpha: true,
  });
  renderer.setClearColor(0x888888, 1);
  renderer.setSize(35, 35);

  // Making Light
  const directionalLight = new DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(10, 10, 10);
  const spotLight = new SpotLight(0xffffff);
  spotLight.position.set(-3, 3, -3);
  scene.add(spotLight);
  scene.add(directionalLight);

  // Create GLTF Loader
  const gltfLoader = new GLTFLoader()
        .setCrossOrigin('anonymous')
        .setDRACOLoader( DRACO_LOADER )
        .setMeshoptDecoder( MeshoptDecoder );

  // Load GLTF and Making Image
  return new Promise((resolve) => {
    gltfLoader.load(
      gltfUrl, 
      (gltf) => {
        const model = gltf.scene || gltf.scenes[0];
        scene.add(model);
        renderer.render(scene, camera);
        const dataUrl = canvas.toDataURL();
        cleanup();
        return resolve(dataUrl);
      },
      (progress) => {},
      (error) => {
        console.error(error);
        cleanup();
        Swal.fire({
          title: "Error",
          text: `Loading GLTF Error。\nFileName: ${gltfUrl}\n\n${error}`,
          icon: "error",
          confirmButtonText: "OK"
        }).then((result) => {
            return resolve(null);
        });
      }
    );
  });
};