import styles from "@/App.module.scss";
import { GLTFViewer } from "@/components/NaniwaEditor/ViewPort/GLTFViewer";
import { MainViewer } from "@/components/NaniwaEditor/ViewPort/MainViewer";
import { NaniwaEditorContext, NaniwaEditorManager } from "@/components/NaniwaEditor/NaniwaEditorManager";
import { useState, useEffect, useContext } from "react";
import { Vector3 } from "three";
import { reqApi } from "@/services/ServciceApi";
import { ContentViewer } from "./ViewPort/ContentViewer";

export interface IFileProps {
    size: number;
    isFile: boolean;
    isDirectory: boolean;
    name: string;
}

export const NaniwaEditor = () => {
    const editor = useContext(NaniwaEditorContext);
    const [viewSelect, setViewSelect] = useState<"mainview"|"terrainmaker"|"gltfviewer"|"scripteditor"|"shadereditor">("mainview");
    const [files, setFiles] = useState<IFileProps[]>([]);
    const [position, setPosition] = useState<Vector3>(new Vector3(0, 0, 0));

    const changeView = (viewType: "mainview"|"terrainmaker"|"gltfviewer"|"scripteditor"|"shadereditor") => {
        if (viewSelect !== viewType){
            setViewSelect(viewType);
        }
    }

    const changePosition = (e, xyz: "x"|"y"|"z") => {
        if (editor.selectObject){
            const newPosition = new Vector3().copy(editor.position);
            if (xyz == "x"){
                newPosition.setX(Number(e.target.value));
            }
            else if (xyz == "y"){
                newPosition.setY(Number(e.target.value));
            }
            else if (xyz == "z") {
                newPosition.setZ(Number(e.target.value));
            }
            editor.position.copy(newPosition);
        }
    }

    useEffect(() => {
        // アセットをロードする
        reqApi({route: "filesize", queryObject: { routePath: "/" }}).then((res) => {
            console.log("ロードする");
            console.log(res);
            if (res.status == 200){
                setFiles(res.data.files);
            }
        })
    }, []);

    useEffect(() => {
        if (editor.selectObject){
            setPosition(editor.position);
        }
    }, [editor.selectObject]);

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
                            <div className={styles.select}>
                                <a 
                                    onClick={() => changeView("mainview")}
                                    style={viewSelect == "mainview"? { background: '#fff', color: "#838383" }: {}}
                                >
                                    メインビュー
                                </a>
                                <a
                                    onClick={() => changeView("terrainmaker")}
                                    style={viewSelect == "terrainmaker"? { background: '#fff', color: "#838383" }: {}}
                                >
                                    地形メーカー
                                </a>
                                <a
                                    onClick={() => changeView("gltfviewer")}
                                    style={viewSelect == "gltfviewer"? { background: '#fff', color: "#838383" }: {}}
                                >
                                    GLTFビューア
                                </a>
                                <a
                                    onClick={() => changeView("scripteditor")}
                                    style={viewSelect == "scripteditor"? { background: '#fff', color: "#838383" }: {}}
                                >
                                    スクリプトエディタ
                                </a>
                                <a
                                    onClick={() => changeView("shadereditor")}
                                    style={viewSelect == "shadereditor"? { background: '#fff', color: "#838383" }: {}}
                                >
                                    シェーダーエディタ
                                </a>
                            </div>
                        </div>
                        <div className={styles.viewport}>
                            {viewSelect == "mainview" &&
                                <>
                                    <MainViewer/>
                                </>
                            }
                            {viewSelect == "terrainmaker" &&
                                <>
                                </>
                            }
                            {viewSelect == "gltfviewer" &&
                                <>
                                    <GLTFViewer/>
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
                            {files.map((file) => {
                                return (
                                    <ContentViewer {...file} />
                                )
                            })}
                        </div>
                    </div>
                    <div className={styles.inspector}>
                        {(viewSelect == "gltfviewer" || viewSelect == "mainview") &&
                            <>
                                <div className={styles.position}>
                                    <div className={styles.title}>
                                        位置
                                    </div>
                                    <div className={styles.name}>
                                        <div>X</div>
                                        <div>Y</div>
                                        <div>Z</div>
                                    </div>
                                    <div className={styles.inputContainer}>
                                        <input type="number" placeholder="0" value={position.x} onChange={(e) => changePosition(e, "x")}/>
                                        <input type="number" placeholder="0" value={position.y} onChange={(e) => changePosition(e, "y")}/>
                                        <input type="number" placeholder="0" value={position.z} onChange={(e) => changePosition(e, "z")}/>
                                    </div>
                                </div>
                                <div className={styles.rotation}>
                                    <div className={styles.title}>
                                        回転
                                    </div>
                                    <div className={styles.name}>
                                        <div>X</div>
                                        <div>Y</div>
                                        <div>Z</div>
                                    </div>
                                    <div className={styles.inputContainer}>
                                        <input type="number" placeholder="0"/>
                                        <input type="number" placeholder="0"/>
                                        <input type="number" placeholder="0"/>
                                    </div>
                                </div>
                            </>
                        }
                        <>
                            
                        </>
                    </div>
                </div>
            </div>
        </>
    )
}