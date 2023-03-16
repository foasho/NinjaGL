import styles from "@/App.module.scss";
import { IObjectManagement } from "@/engine/Core/NaniwaProps";
import { useRef, useContext, useEffect, useState } from "react";
import { NaniwaEditorContext } from "../NaniwaEditorManager";

export const MainViewInspector = () => {
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
  const [selectOM, setSelectOM] = useState<IObjectManagement>(null);
  const id = selectOM? selectOM.id: null;

  useEffect(() => {
    const interval = setInterval(() => {
      myFrame();
    }, 1000 / 10);
    return () => clearInterval(interval);
  }, [selectOM])

  const myFrame = () => {
    if (id){
      const position = editor.getPosition(id);
      if (position && selectOM.type == "object") {
        refPosX.current.value = position.x.toString();
        refPosY.current.value = position.y.toString();
        refPosZ.current.value = position.z.toString();
      }
      const rotation = editor.getRotation(id);
      if (rotation && selectOM.type == "object") {
        refRotX.current.value = rotation.x.toString();
        refRotY.current.value = rotation.y.toString();
        refRotZ.current.value = rotation.z.toString();
      }
      const scale = editor.getScale(id);
      if (scale && selectOM.type == "object") {
        refScaX.current.value = scale.x.toString();
        refScaY.current.value = scale.y.toString();
        refScaZ.current.value = scale.z.toString();
      }
    }
    if (selectOM != editor.getSelectOM()){
      setSelectOM(editor.getSelectOM());
    }
  }

  const changePosition = (e, xyz) => { }

  return (
    <>
      {(
        selectOM &&
        (
          selectOM.type == "object" ||
          selectOM.type == "avatar"
        )
      ) &&
        <div className={styles.mainInspector}>
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
              <input ref={refPosX} type="text" placeholder="0" value={selectOM.object.position.x} onChange={(e) => changePosition(e, "x")} />
              <input ref={refPosY} type="text" placeholder="0" value={selectOM.object.position.y} onChange={(e) => changePosition(e, "y")} />
              <input ref={refPosZ} type="text" placeholder="0" value={selectOM.object.position.z} onChange={(e) => changePosition(e, "z")} />
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
              <input ref={refRotX} type="text" placeholder="0" />
              <input ref={refRotY} type="text" placeholder="0" />
              <input ref={refRotZ} type="text" placeholder="0" />
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
              <input ref={refScaX} type="text" placeholder="0" value={selectOM.object.scale.x} />
              <input ref={refScaY} type="text" placeholder="0" value={selectOM.object.scale.y} />
              <input ref={refScaZ} type="text" placeholder="0" value={selectOM.object.scale.z} />
            </div>
          </div>
          <div className={styles.material}>
            <div className={styles.title}>
              マテリアル設定
            </div>
            <div className={styles.type}>
              <div className={styles.name}>
                種別
              </div>
              <div>
              </div>
            </div>
            <div className={styles.color}>
              <div className={styles.name}>
                色
              </div>
              <div className={styles.pallet}>
                <input type={"color"} value={"#43D9D9"}/>
                <input type={"text"} value={"#43D9D9"} />
              </div>
            </div>
          </div>
          <div className={styles.physics}>
            <div className={styles.title}>
              物理判定の有無
            </div>
            <div className={styles.input}>
              <input type="checkbox" className={styles.checkbox} />
              <span className={styles.customCheckbox}></span>
            </div>
          </div>
        </div>
      }
      {(selectOM && selectOM.type == "light") &&
        <>

        </>
      }
    </>
  )
}

const StaticInspector = () => {

}