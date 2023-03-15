import styles from "@/App.module.scss";
import { IObjectManagement } from "@/engine/core/NaniwaProps";
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
    }
    if (selectOM != editor.getSelectOM()){
      setSelectOM(editor.getSelectOM());
    }
  }

  const changePosition = (e, xyz) => { }

  return (
    <>
      {(selectOM && selectOM.type == "object") &&
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
              <input ref={refPosX} type="number" placeholder="0" value={selectOM.object.position.x} onChange={(e) => changePosition(e, "x")} />
              <input ref={refPosY} type="number" placeholder="0" value={selectOM.object.position.y} onChange={(e) => changePosition(e, "y")} />
              <input ref={refPosZ} type="number" placeholder="0" value={selectOM.object.position.z} onChange={(e) => changePosition(e, "z")} />
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
              <input ref={refRotX} type="number" placeholder="0" />
              <input ref={refRotY} type="number" placeholder="0" />
              <input ref={refRotZ} type="number" placeholder="0" />
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
              <input ref={refScaX} type="number" placeholder="0" value={selectOM.object.scale.x} />
              <input ref={refScaY} type="number" placeholder="0" value={selectOM.object.scale.y} />
              <input ref={refScaZ} type="number" placeholder="0" value={selectOM.object.scale.z} />
            </div>
          </div>
        </>
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