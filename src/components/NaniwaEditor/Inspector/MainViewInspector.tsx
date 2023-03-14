import styles from "@/App.module.scss";
import { IObjectManagement } from "@/engine/core/NaniwaProps";
import { useRef, useContext, useEffect } from "react";
import { NaniwaEditorContext } from "../NaniwaEditorManager";

export interface IMainViewInspector {
    om: IObjectManagement;
}
export const MainViewInspector = (props: IMainViewInspector) => {
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
        if (position && props.om.type == "object"){
            refPosX.current.value = position.x.toString();
            refPosY.current.value = position.y.toString();
            refPosZ.current.value = position.z.toString();
        }
        const rotation = editor.getRotation(uuid);
        if (rotation && props.om.type == "object"){
            refRotX.current.value = rotation.x.toString();
            refRotY.current.value = rotation.y.toString();
            refRotZ.current.value = rotation.z.toString();
        }
    }

    const changePosition = (e, xyz) => {}

    console.log("object確認");
    console.log(props.om.type);

    return (
        <>
            { props.om.type == "object" &&
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
            }
            { props.om.type == "light" &&
                <></>
            }
        </>
    )
}