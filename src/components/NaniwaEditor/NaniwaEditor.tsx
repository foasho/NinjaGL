import styles from "@/App.module.scss";
import { GLTFViewer } from "@/components/NaniwaEditor/ViewPort/GLTFViewer";
import { MainViewer } from "@/components/NaniwaEditor/ViewPort/MainViewer";
import { NaniwaEditorContext, NaniwaEditorManager } from "@/components/NaniwaEditor/NaniwaEditorManager";
import { useState, useEffect, useContext, useRef } from "react";
import { Object3D, Vector3 } from "three";
import { reqApi } from "@/services/ServciceApi";
import { ContentViewer } from "./ViewPort/ContentViewer";
import { PivotControls } from "@react-three/drei";
import { IObjectManagement } from "@/engine/core/NaniwaProps";
import { ScriptEditor } from "./ViewPort/ScriptEditor";

export interface IFileProps {
    size: number;
    isFile: boolean;
    isDirectory: boolean;
    name: string;
    onDoubleClick?: (type: string, value: string) => void;
}

export const NaniwaEditor = () => {
    const editor = useContext(NaniwaEditorContext);
    const [viewSelect, setViewSelect] = useState<"mainview"|"terrainmaker"|"gltfviewer"|"scripteditor"|"shadereditor">("mainview");
    const [files, setFiles] = useState<IFileProps[]>([]);
    const [position, setPosition] = useState<Vector3>(new Vector3(0, 0, 0));
    const [selectOMs, setSelectOMs] = useState<IObjectManagement[]>([]);

    const changeView = (viewType: "mainview"|"terrainmaker"|"gltfviewer"|"scripteditor"|"shadereditor") => {
        if (viewSelect !== viewType){
            setViewSelect(viewType);
        }
    }

    const changePosition = (e, xyz: "x"|"y"|"z") => {
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
        reqApi({route: "filesize", queryObject: { routePath: "/" }}).then((res) => {
            if (res.status == 200){
                setFiles(res.data.files);
            }
        })
    }, []);

    const onDoubleClick = (type: "directory"|"gltf"|"js", value: string) => {
        if (type == "directory"){
            reqApi({route: "filesize", queryObject: { routePath: value }}).then((res) => {
                if (res.status == 200){
                    setFiles(res.data.files);
                }
            })
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            myFrame();
        }, 1000 / 10);
        return () => clearInterval(interval);
    }, [selectOMs.length])

    const myFrame = () => {
        const _selectOMs = editor.getSelectObjects();
        if (selectOMs.length !== _selectOMs.length){
            console.log("確認");
            setSelectOMs(_selectOMs);
        }
    }

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
                                    <ScriptEditor/>
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
                                    <ContentViewer {...file} onDoubleClick={onDoubleClick} />
                                )
                            })}
                        </div>
                    </div>
                    <div className={styles.inspector}>
                        {viewSelect == "mainview" &&
                            <>
                                {selectOMs.map((om) => {
                                    return <Inspector om={om} />
                                })}
                            </>
                        }
                        {viewSelect == "scripteditor" && 
                            <>
                            </>
                        }
                        {viewSelect == "terrainmaker" &&
                            <>
                            </>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

interface IInspector {
    om: IObjectManagement;
}
const Inspector = (props: IInspector) => {
    const editor = useContext(NaniwaEditorContext);
    const refPosX = useRef<HTMLInputElement>();
    const refPosY = useRef<HTMLInputElement>();
    const refPosZ = useRef<HTMLInputElement>();
    const refRotX = useRef<HTMLInputElement>();
    const refRotY = useRef<HTMLInputElement>();
    const refRotZ = useRef<HTMLInputElement>();
    const refScaX = useRef<HTMLInputElement>();
    const refScaY = useRef<HTMLInputElement>();
    const refScaZ = useRef<HTMLInputElement>();
    const { object } = props.om;
    const uuid = object.uuid;

    useEffect(() => {
        const interval = setInterval(() => {
            myFrame();
        }, 1000 / 10);
        return () => clearInterval(interval);
    }, [])

    const myFrame = () => {
        const position = editor.getPosition(uuid);
        if (position){
            refPosX.current.value = position.x.toString();
            refPosY.current.value = position.y.toString();
            refPosZ.current.value = position.z.toString();
        }
        const rotation = editor.getRotation(uuid);
        if (rotation){
            refRotX.current.value = rotation.x.toString();
            refRotY.current.value = rotation.y.toString();
            refRotZ.current.value = rotation.z.toString();
        }
    }

    const changePosition = (e, xyz) => {}

    return (
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
                    <input ref={refPosX} type="number" placeholder="0" value={object.position.x} onChange={(e) => changePosition(e, "x")}/>
                    <input ref={refPosY} type="number" placeholder="0" value={object.position.y} onChange={(e) => changePosition(e, "y")}/>
                    <input ref={refPosZ} type="number" placeholder="0" value={object.position.z} onChange={(e) => changePosition(e, "z")}/>
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
                    <input ref={refRotX} type="number" placeholder="0"/>
                    <input ref={refRotY} type="number" placeholder="0"/>
                    <input ref={refRotZ} type="number" placeholder="0"/>
                </div>
            </div>
            <div className={styles.scale}>
                <div className={styles.title}>
                    スケール
                </div>
                <div className={styles.name}>
                    <div>X</div>
                    <div>Y</div>
                    <div>Z</div>
                </div>
                <div className={styles.inputContainer}>
                    <input ref={refScaX} type="number" placeholder="0" value={object.scale.x}/>
                    <input ref={refScaY} type="number" placeholder="0" value={object.scale.y}/>
                    <input ref={refScaZ} type="number" placeholder="0" value={object.scale.z}/>
                </div>
            </div>
        </>
    )
}