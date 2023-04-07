import { useState } from "react";
import { TouchController } from "./TouchController"
import styles from "@/App.module.scss";

interface IUICanvas {
    
}
export const UICanvas = () => {
    const [gridNum, setGridNum] = useState<number>(8);
    return (
        <>
            <TouchController />
            <UICanvasHelper gridNum={gridNum}/>
        </>
    )
}

interface IUICanvasHelper {
    gridNum: number;
}
const UICanvasHelper = (props: IUICanvasHelper) => {
    return (
        <>
            <div className={styles.uicanvashelper}>
                <div className={styles.name}>
                    UI
                </div>
                <div className={styles.gridContainer}>
                    {Array(props.gridNum).fill(0).map((_, i) => {
                        return (
                            <div className={styles.gridItem} key={i}></div>
                        )
                    })}
                </div>
            </div>
        </>
    );
}