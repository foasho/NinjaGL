import styles from "@/App.module.scss";
import { NaniwaEditor } from "@/components/NaniwaEditor/MainViewer";
import { useState, useEffect } from "react";

/**
* エディタ表示
*/
interface IEditModeContainer {
    children: JSX.Element;
}
export const EditModeContainer = (props: IEditModeContainer) => {
    const [hierarchy, setHierarchy] = useState<boolean>();
    const [contentsBrowser, setContentsBrowser] = useState<boolean>();
    const [inspector, setInspector] = useState<boolean>();
    return (
        <>
        </>
    )
}


/**
 * Responsiveコンポーネント
 */
export interface IResponsiveContainer {
    children   : JSX.Element;
    isPlayMode : boolean;
}
export const ResponsiveContainer = (props: IResponsiveContainer) => (
    <>
        {props.isPlayMode == false &&
        <EditModeContainer>{props.children}</EditModeContainer>
        }
        {/* <DebugModeContainer isHeading={props.isHeading}>{props.children}</DebugModeContainer> */}
    </>
)

interface IAssetFiles {
    name: string;
    type: "image" | "gltf" | "mp3" | "json" | "javascript" | "other";
    size: number;
}

const NaniwaEditorComponent = () => {

    const [viewSelect, setViewSelect] = useState<"mainview"|"terrainmaker"|"gltfviewer"|"scripteditor"|"shadereditor">("mainview");

    const [assetFiles, setAssetFiles] = useState<IAssetFiles[]>([]);
    
    useEffect(() => {
        (async () => {
            // アセットファイルをすべて読み取る
        })()
    }, []);

    return (
        <>
            <div className={styles.editor}>
                <div className={styles.appBar}>
                    <ul className={styles.nav}>
                        <li className={styles.navItem}>
                            <a>ファイル</a>
                        </li>
                        <li className={styles.navItem}>
                            <a>言語(JP)</a>
                        </li>
                        <li className={styles.navItem}>
                            <a>Github</a>
                        </li>
                    </ul>
                </div>
                <div className={styles.mainContents}>
                    <div className={styles.hierarchy}>
                        <div className={styles.hierarchyArea}>
                            <div className={styles.hierarchyOpen}>
                                '-閉じる'
                            </div>
                            <div className={styles.hierarchyTree}>

                            </div>
                        </div>
                    </div>
                    <div className={styles.contents}>
                        <div className={styles.viewselect}>

                        </div>
                        <div className={styles.viewport}>
                            {viewSelect == "mainview" &&
                                <>
                                    <NaniwaEditor/>
                                </>
                            }
                            {viewSelect == "terrainmaker" &&
                                <>
                                </>
                            }
                            {viewSelect == "gltfviewer" &&
                                <>
                                </>
                            }
                            {viewSelect == "scripteditor" &&
                                <>
                                </>
                            }
                            {viewSelect == "shadereditor" &&
                                <>
                                </>
                            }
                        </div>
                        <div className={styles.contentsbrowser}>
                            
                        </div>
                    </div>
                    <div className={styles.inspector}>
                        インスペクタ
                    </div>
                </div>
            </div>
            
        </>
    )
}


export default NaniwaEditorComponent;