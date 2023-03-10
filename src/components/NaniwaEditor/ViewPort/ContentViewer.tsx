import { IFileProps } from "../NaniwaEditor";
import styles from "@/App.module.scss";

import { 
    BsFileImage,
    BsFolder
} from "react-icons/bs";
import { useContext, useEffect } from "react";
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


export const ContentViewer = (props: IFileProps) => {
    const idName = `file-${props.name}`;
    let icon: JSX.Element;
    let tooltipTimer: NodeJS.Timeout = null;
    const editor = useContext(NaniwaEditorContext);
    const tooltip = document.createElement('div');
    let contentsSelectType: "gltf" | "mp3" | "js" | "glsl" | "image" = null;
    if (props.isFile){
        if (isImage(props.name)){
            icon = (
                <>
                    <img src={`${editor.assetRoute}/${props.name}`} style={{maxWidth: "50px", height: "30%" }} />
                </>
            )
            contentsSelectType = "image";
        }
        else if (isGLTF(props.name)){
            icon = (
                <>
                    <img src={gltf_icon} style={{maxWidth: "50px", height: "30%" }} data-path={props.name} />
                </>
            )
            contentsSelectType = "gltf";
        }
        else if (isMP3(props.name)){
            icon = (
                <>
                    <img src={mp3_icon} style={{maxWidth: "50px", height: "30%" }} data-path={props.name} />
                </>
            )
            contentsSelectType = "mp3";
        }
        else if (isGLSL(props.name)){
            icon = (
                <>
                    <img src={glsl_icon} style={{maxWidth: "50px", height: "30%" }} data-path={props.name} />
                </>
            )
            contentsSelectType = "glsl";
        }
        else if (isJS(props.name)){
            icon = (
                <>
                    <img src={js_icon} style={{maxWidth: "50px", height: "30%" }} data-path={props.name} />
                </>
            )
            contentsSelectType = "js";
        }
        // どれにも該当しない場合は表示しない
        else {
            return (<></>)
        }
    }
    else if (props.isDirectory){
        icon = (
            <a  style={{maxWidth: "50px", height: "30%", fontSize: "30px" }}>
                <BsFolder/>
            </a>
        )
    }

    const viewTooltip = () => {
        console.log("表示するよん");
        tooltip.style.display = "block";
    }

    const onHover = (e) => {
        if (icon){
            if (props.isFile){
                if (tooltipTimer){
                    clearInterval(tooltipTimer)
                    tooltipTimer = null;
                }
                
                tooltip.style.left = e.clientX;
                tooltip.style.top = "-60px";
                tooltipTimer = setTimeout(viewTooltip, 3000);
            }
        }
    }

    const onMouseOut = (e) => {
        if (tooltipTimer){
            clearInterval(tooltipTimer)
            tooltipTimer = null;
        }
        tooltip.style.display = "none";
    }

    const onDoubleClick = () => {
        if (props.isDirectory){
            const newRoute = editor.assetRoute+"/"+props.name;
            if (props.onDoubleClick){
                props.onDoubleClick("directory", newRoute);
            }
        }
    }

    const onDragStart = () => {
        console.log("選択", props.name);
        editor.contentsSelectPath = `${editor.assetRoute}/${props.name}`;
        editor.contentsSelect = true;
    }
    const onDragEnd = () => {
        console.log("解除", props.name);
        editor.contentsSelectPath = "";
        editor.contentsSelect = false;
    }

    useEffect(() => {
        tooltip.innerText = `ファイル名:${props.name} \n サイズ:${props.size}`;
        tooltip.style.padding = "10px";
        tooltip.style.color = "#fff";
        tooltip.style.background = "#000";
        tooltip.style.zIndex = "99999";
        tooltip.style.position = "absolute";
        tooltip.style.display = "none";
        tooltip.style.fontSize = "10px";
        tooltip.style.width = "200px";
        if (icon && props.isFile){
            const ele = document.getElementById(idName);
            ele.appendChild(tooltip);
        }
    }, [])

    return  (
        <>
            
            <div 

                onDoubleClick={(e) => onDoubleClick()}
                className={styles.tooltip}
                onMouseOver={(e) => onHover(e)}
                onMouseOut={(e) => onMouseOut(e)}
                onDragStart={(e) => onDragStart()}
                onDragEnd={(e) => onDragEnd()}
                style={{ maxWidth: "50px", textAlign: "center", display: "inline-block", padding: "5px" }}
            >
                <div className={styles.tooltip} id={idName}></div>
                {icon}
                <div className={styles.itemName}>
                    {props.name}
                </div>
            </div>
        </>
    )
}