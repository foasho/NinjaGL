import styles from "@/App.module.scss";

import {
  BsFileImage,
  BsFolder
} from "react-icons/bs";
import { useContext, useEffect, useRef, useState } from "react";
import { reqApi } from "@/services/ServciceApi";
import { NinjaEditorContext } from "../NinjaEditorManager";
import { AmbientLight, DirectionalLight, LoadingManager, PerspectiveCamera, Scene, SpotLight, WebGLRenderer } from "three";
import { DRACOLoader, GLTFLoader, KTX2Loader } from "three-stdlib";
import { MeshoptDecoder } from "meshoptimizer";
import { useTranslation } from "react-i18next";
import { AiFillHome } from "react-icons/ai";
import Swal from "sweetalert2";

export interface IFileProps {
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  onChangeScriptPath: (path: string) => void;
  onDoubleClick?: (type: string, value: string) => void;
  imageUrl?: string;
}


const getExtension = (filename: string) => {
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
  changeScriptEditor: (path: string) => void;
} 

export const ContentsBrowser = (props: IContentsBrowser) => {
  const editor = useContext(NinjaEditorContext);
  const { t } = useTranslation();
  const [files, setFiles] = useState<IFileProps[]>([]);
  const loadRef = useRef<HTMLDivElement>();

  const getGLTFImage = async (file: IFileProps): Promise<string> => {
    if (file.isFile && isGLTF(file.name)){
      return await CreateGLTFImage(`${editor.assetRoute}/${file.name}`);
    }
    return null
  }

  useEffect(() => {
    // アセットをロードする
    reqApi({ route: "filesize", queryObject: { routePath: "/" } }).then(async (res) => {
      if (res.status == 200) {
        loadRef.current.style.display = "block";
        const _files = res.data.files;
        const newFiles = [];
        for (const file of _files){
          const imageUrl = await getGLTFImage(file);
          if (imageUrl){
            file.imageUrl = imageUrl;
          }
          else {
            if (isGLTF(file.name)){
              continue;
            }
          }
          newFiles.push(file);
        }
        setFiles(newFiles);
        loadRef.current.style.display = "none";
      }
    })
  }, []);

  const onDoubleClick = (type: "directory" | "gltf" | "js", path: string) => {
    if (type == "directory") {
      reqApi({ route: "filesize", queryObject: { routePath: path } }).then(async (res) => {
        if (res.status == 200) {
          loadRef.current.style.display = "block";
          editor.assetRoute = (path != "/") ? path : "";
          const _files = res.data.files;
          const newFiles = [];
          for (const file of _files){
            const imageUrl = await getGLTFImage(file);
            if (imageUrl){
              file.imageUrl = imageUrl;
            }
            else {
              if (isGLTF(file.name)){
                continue;
              }
            }
            newFiles.push(file);
          }
          setFiles(newFiles);
          loadRef.current.style.display = "none";
        }
      })
    }
  }

  /**
   * パスを押して移動
   * @param value 
   */
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
    reqApi({ route: "filesize", queryObject: { routePath: path } }).then(async (res) => {
      if (res.status == 200) {
        loadRef.current.style.display = "block";
        editor.assetRoute = (path != "/") ? path : "";
        const _files = res.data.files;
        const newFiles = [];
        for (const file of _files){
          const imageUrl = await getGLTFImage(file);
          if (imageUrl){
            file.imageUrl = imageUrl;
          }
          else {
            if (isGLTF(file.name)){
              continue;
            }
          }
          newFiles.push(file);
        }
        setFiles(newFiles);
        loadRef.current.style.display = "none";
      }
    })
  }

  return (
    <>
      <div className={styles.pathName}>
        <div className={styles.title}>
          {t("contentsBrowser")}
          <span className={styles.home} onClick={() => onMoveDic("")}>
            <AiFillHome />
          </span>
        </div>
        {editor.assetRoute.split("/").map((route, idx) => {
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
            <>
              <ContentViewer 
                {...file} onDoubleClick={onDoubleClick}
                onChangeScriptPath={props.changeScriptEditor}
              />
            </>
          )
        })}
        <div className={styles.loader} ref={loadRef}>
          <div className={styles.now}>
            {t("nowLoading")}
          </div>
        </div>
      </div>
    </>
  )
}


export const ContentViewer = (props: IFileProps) => {
  let icon: JSX.Element;
  let tooltipTimer: NodeJS.Timeout = null;
  let tooltip = useRef<HTMLDivElement>();
  const editor = useContext(NinjaEditorContext);
  const { t } = useTranslation();
  let contentsSelectType: "gltf" | "mp3" | "js" | "glsl" | "image" | "ter" | "avt" = null;
  if (props.isFile) {
    if (isImage(props.name)) {
      icon = (
        <>
          <img src={`${editor.assetRoute}/${props.name}`} className={styles.iconImg} />
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
          <img src={js_icon} className={styles.iconImg} data-path={props.name} />
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

  const viewTooltip = () => {
    tooltip.current.style.display = "block";
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

  const onDoubleClick = (type: string) => {
    if (props.isDirectory) {
      const newRoute = editor.assetRoute + "/" + props.name;
      if (props.onDoubleClick) {
        props.onDoubleClick("directory", newRoute);
      }
    }
    else if (props.isFile && type == "js"){
      props.onChangeScriptPath(`${editor.assetRoute}/${props.name}`);
    }
  }

  const onDragStart = () => {
    editor.contentsSelectType = contentsSelectType;
    editor.contentsSelectPath = `${editor.assetRoute}/${props.name}`;
    editor.contentsSelect = true;
  }
  const onDragEnd = () => {
    editor.contentsSelectType = null;
    editor.contentsSelectPath = "";
    editor.contentsSelect = false;
  }

  return (
    <>
      <div
        onDoubleClick={(e) => onDoubleClick(contentsSelectType)}
        className={styles.itemCard}
        onDragStart={(e) => onDragStart()}
        onDragEnd={(e) => onDragEnd()}
      >
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
  const DRACO_LOADER = new DRACOLoader();
  const KTX2_LOADER = new KTX2Loader();
  const gltfLoader = new GLTFLoader()
        .setCrossOrigin('anonymous')
        .setDRACOLoader( DRACO_LOADER )
        .setKTX2Loader( KTX2_LOADER.detectSupport( renderer ) )
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