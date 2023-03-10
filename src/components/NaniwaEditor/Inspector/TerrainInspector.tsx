import styles from "@/App.module.scss";
import { useContext, useEffect, useState } from "react";
import { NaniwaEditorContext } from "../NaniwaEditorManager";

/**
 * 入力イベント / 入力の型
 */
interface HTMLElementEvent<T extends HTMLElement> extends Event {
    target : T;
    code   : string;
}


export const TerrainInspector = () => {
    const editor = useContext(NaniwaEditorContext);
    const terrainManager = editor.terrainManager;
    const [mode, setMode] = useState<"view"|"edit">(terrainManager.mode);
    const [wf, setWF] = useState<boolean>(terrainManager.wireFrame);
    const [power, setPower] = useState<number>(terrainManager.power);
    const [radius, setRadius] = useState<number>(terrainManager.radius);
    const [mapSize, setMapSize] = useState<number>(terrainManager.mapSize);
    const [mapResolution, setMapResolution] = useState<number>(terrainManager.mapResolution);
    const [color, setColor] = useState<string>(terrainManager.color);

    const keyDown = (event: HTMLElementEvent<HTMLInputElement>) => {
        if (event.code.toString() == "KeyE") {
            terrainManager.changeMode();
            setMode(terrainManager.mode);
        }
    }
    
    useEffect(() => {
        setMode(terrainManager.mode);
        document.addEventListener("keydown", keyDown);
        return () => {
            document.removeEventListener("keydown", keyDown);
        }
    }, []);

    const changeMode = () => {
        terrainManager.changeMode();
        setMode(terrainManager.mode);
    }

    const changeWF = () => {
        terrainManager.changeWireFrame();
        setWF(terrainManager.wireFrame);
    }

    const changePower = (e: any) => {
        terrainManager.changePower(Number(e.target.value));
        setPower(Number(e.target.value));
    }

    const changeRadius = (e: any) => {
        terrainManager.changeRaduis(Number(e.target.value));
        setRadius(Number(e.target.value));
    }

    const changeMapSize = (e) => {
        if (e.target.value && Number(e.target.value)>0){
            setMapSize(Number(e.target.value));
        }
    }

    const changeMapResolution = (e) => {
        if (e.target.value && Number(e.target.value)>0){
            setMapResolution(Number(e.target.value));
        }
    }

    const changeColor = (e) => {
        setColor(e.target.value);
        terrainManager.changeColor(e.target.value);
    }

    const updateMap = () => {
        terrainManager.changeMapSize(mapSize);
        terrainManager.changeMapResolution(mapResolution);
        terrainManager.reset();
    }

    return (
        <div className={styles.terrainui}>
            <div className={styles.mode}>
                <div>モード</div>
                <div>
                    <span>表示</span>
                    <span>編集</span>
                </div>
            </div>
            <div className={styles.type}>
                <div>ブラシ種別</div>
                <div>
                    <span>通常</span>
                    <span>平坦化</span>
                    <span>ペイント</span>
                </div>
            </div>
            <div className={styles.wire}>
                <div>ワイヤーフレーム</div>
                <div>
                    <span>表示</span>
                    <span>非表示</span>
                </div>
            </div>
            <div className={styles.strength}>
                <div>変形させる強さ</div>
                <div>
                    <input type={"range"} />
                </div>
            </div>
            <div className={styles.range}>
                <div>変形させる範囲</div>
                <div>
                    <input type={"range"} />
                </div>
            </div>
            <div className={styles.material}>
                <div>色</div>
                <div>
                    <input type={"color"} />
                </div>
            </div>
            <div className={styles.size}>
                <div>サイズ</div>
                <div>
                    <input type={"number"} />
                </div>
            </div>
            <div className={styles.resolution}>
                <div>解像度</div>
                <div>
                    <input type={"number"} />
                </div>
            </div>
        </div>
    )
}