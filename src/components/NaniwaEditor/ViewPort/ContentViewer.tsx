import { IFileProps } from "../NaniwaEditor";
import styles from "@/App.module.scss";

import { 
    BsFileImage,
    BsFolder
} from "react-icons/bs";
import { useEffect } from "react";
import { reqApi } from "@/services/ServciceApi";

const getExtension = (filename: string) => {
    return filename.split('.').pop().toLowerCase();
}

const isImage = (filename: string) => {
    const ext = getExtension(filename);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

export const ContentViewer = (props: IFileProps) => {
    const idName = `file-${props.name}`;
    let icon: JSX.Element;
    let tooltipTimer: NodeJS.Timeout = null;
    const tooltip = document.createElement('div')
    if (props.isFile){
        if (isImage(props.name)){
            icon = (
                <>
                    <img src={props.name} style={{maxWidth: "50px", height: "30%" }} />
                </>
            )
            
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

    const onClick = () => {
        if (props.isDirectory){
            const newRoute = "/"+props.name;
            // reqApi({route: "filesize", queryObject: { routePath: newRoute }}).then(() => {});
        }
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
                onClick={() => onClick()}
                className={styles.tooltip}
                onMouseOver={(e) => onHover(e)}
                onMouseOut={(e) => onMouseOut(e)}
                style={{ maxWidth: "50px", textAlign: "center", display: "inline-block", padding: "5px" }}

            >
                <div className={styles.tooltip} id={idName}></div>
                {icon}
                <div style={{ fontSize: "10px"}}>
                    {props.name}
                </div>
            </div>
        </>
    )
}