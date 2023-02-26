import { useContext } from "react";
import { LoadProcessing } from "./UIItems/LoadProcessing";
import styles from "@/App.module.scss";
// Icons
import { BsHandbagFill } from "react-icons/bs";
import { TouchMove } from "./UIItems/TouchMove";
import { NaniwaEngineContext } from "@/engine/NaniwaEngineManager";

export const NaniwaUI = () => {
    const engine = useContext(NaniwaEngineContext);
    return (
        <>
            <LoadProcessing/>
            {engine.deviceType == "mobile" || engine.deviceType == "tablet" &&
                <TouchMove/>
            }
            <div className={styles.naniwaui}>
                <div className={styles.rightTop}>
                    <a className={styles.icon}>
                        <BsHandbagFill/>
                    </a>
                </div>
            </div>
        </>
    )
}