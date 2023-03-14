import { IFileProps } from "../NaniwaEditor";
import styles from "@/App.module.scss";

import {
  BsFileImage,
  BsFolder
} from "react-icons/bs";
import { useContext, useEffect, useRef } from "react";
import { reqApi } from "@/services/ServciceApi";
import { NaniwaEditorContext } from "../NaniwaEditorManager";

const getExtension = (filename: string) => {
  return filename.split('.').pop().toLowerCase();
}

const isImage = (filename: string) => {
  const ext = getExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

const gltf_icon = "fileicons/gltf.png";
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


export const ContentViewer = (props: IFileProps) => {
  const idName = `file-${props.name}`;
  let icon: JSX.Element;
  let tooltipTimer: NodeJS.Timeout = null;
  let tooltip = useRef<HTMLDivElement>();
  const editor = useContext(NaniwaEditorContext);
  let contentsSelectType: "gltf" | "mp3" | "js" | "glsl" | "image" | "ter" = null;
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
          <img src={gltf_icon} className={styles.iconImg} data-path={props.name} />
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