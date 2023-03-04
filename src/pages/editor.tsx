import styles from "@/App.module.scss";
import { useState } from "react";

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

const NaniwaEditorComponent = () => {

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
                        <div className={styles.viewport}>
                            ビューポート
                        </div>
                        <div className={styles.contentsbrowser}>
                            コンテンツブラウザ
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