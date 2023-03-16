import { IFileProps } from "../NaniwaEditor";
import styles from "@/App.module.scss";

import {
  BsFileImage,
  BsFolder
} from "react-icons/bs";
import { useContext, useEffect, useRef, useState } from "react";
import { reqApi } from "@/services/ServciceApi";
import { NaniwaEditorContext } from "../NaniwaEditorManager";
import { AmbientLight, DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";


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

const ava_icon = "fileicons/avatar.png";
const isAvatar = (filename: string) => {
  const ext = getExtension(filename);
  return ['avt'].includes(ext);
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

export const ContentBrowser = () => {
  
}

export const ContentViewer = (props: IFileProps) => {
  let icon: JSX.Element;
  let tooltipTimer: NodeJS.Timeout = null;
  let tooltip = useRef<HTMLDivElement>();
  const editor = useContext(NaniwaEditorContext);
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
          {/* <img src={gltf_icon} className={styles.iconImg} data-path={props.name} /> */}
          <div className={styles.iconImg}>
            <CanvasGLTFViewer gltfUrl={`${editor.assetRoute}/${props.name}`}/>
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
    else if (isAvatar(props.name)) {
      icon = (
        <>
          <img src={ava_icon} className={styles.iconImg} data-path={props.name} />
        </>
      )
      contentsSelectType = "avt";
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
    console.log("表示するよん");
    tooltip.current.style.display = "block";
    if (icon && props.isFile) {
      console.log("実際に表示");
    }
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
    console.log("非表示にする");
  }

  const onDoubleClick = () => {
    if (props.isDirectory) {
      const newRoute = editor.assetRoute + "/" + props.name;
      if (props.onDoubleClick) {
        props.onDoubleClick("directory", newRoute);
      }
    }
  }

  const onDragStart = () => {
    console.log("選択", props.name);
    editor.contentsSelectType = contentsSelectType;
    editor.contentsSelectPath = `${editor.assetRoute}/${props.name}`;
    editor.contentsSelect = true;
  }
  const onDragEnd = () => {
    console.log("解除", props.name);
    editor.contentsSelectType = null;
    editor.contentsSelectPath = "";
    editor.contentsSelect = false;
  }

  return (
    <>
      <div
        onDoubleClick={(e) => onDoubleClick()}
        className={styles.itemCard}
        onDragStart={(e) => onDragStart()}
        onDragEnd={(e) => onDragEnd()}
      >
        <div
          className={styles.tooltip}
          ref={tooltip}
        >
          <strong>ファイル名</strong><br />
          {props.name}
          <br />
          <strong>サイズ</strong><br />
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


const CanvasGLTFViewer = ({ gltfUrl }) => {
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  useEffect(() => {
    // シーンを作成
    const scene = new Scene();

    // カメラを作成
    const camera = new PerspectiveCamera(
      45,
      1,
      0.1,
      1000
    );
    camera.position.set(0, 0, 2);

    // レンダラーを作成
    if (canvasRef.current){
      const renderer = new WebGLRenderer({ 
        canvas: canvasRef.current,
        alpha: true,
      });
      renderer.setClearColor(0x888888, 1);
      renderer.setSize(35, 35);
  
      // ライトを作成
      const ambientLight = new AmbientLight(0xffffff, 1);
      const directionalLight = new DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(10, 10, 10);
      scene.add(ambientLight);
      scene.add(directionalLight);
  
      // GLTFローダーを作成
      const gltfLoader = new GLTFLoader();
  
      // GLTFファイルを読み込む
      gltfLoader.load(gltfUrl, (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        renderer.render(scene, camera);
        const dataUrl = canvasRef.current.toDataURL();
        setImageUrl(dataUrl);
      });
    }
  }, []);

  return (
    <>
      {!imageUrl && <canvas ref={canvasRef} style={{backgroundImage: `url('${object_icon}')`, backgroundSize: "cover" }}/>}
      {imageUrl && <img src={imageUrl} alt="GLTF Model" className={styles.iconImg} />}
    </>
  )
};