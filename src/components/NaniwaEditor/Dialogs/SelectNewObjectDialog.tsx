import styles from "@/App.module.scss";
import { useState } from "react";
import ReactDOM from "react-dom";
import { AiOutlineCodeSandbox } from "react-icons/ai";
import { BiCapsule, BiCylinder, BiRectangle } from "react-icons/bi";
import { ImSphere } from "react-icons/im";

interface IResponse {
  response: (data: ISelectNewObjectDialog) => void;
}
const SelectNewObjectDialog = (prop: IResponse) => {
  const [selectType, setSelectType] = useState<string>(null);
  const handleClickOutside = (event) => {
    if (event.target.classList.contains(styles.selectNewObjectDialog)) {
      prop.response({ type: null, value: null });
    }
  };
  const selectLight = (value: string) => {
    prop.response({ type: "light", value: value });
  }
  const selectSky = (value: string) => {
    prop.response({ type: "sky", value: value });
  }
  const selectObj = (value: string) => {
    prop.response({ type: "object", value: value });
  }
  const uploadSound = (e) => {
    console.log("サウンドがアップロードされました");
    console.log(e);
  }
  return ReactDOM.createPortal(
    <div
      className={styles.selectNewObjectDialog}
      onClick={handleClickOutside}
    >
      <div className={styles.dialog}>
        <div className={styles.title}>
          追加するオブジェクト選択
        </div>
        <div className={styles.cards}>
          {selectType == null &&
          <>
            <div className={styles.card} onClick={() => {setSelectType("light")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/light.png"/>
              </div>
              <div className={styles.name}>
                光源
              </div>
            </div>
            <div className={styles.card} onClick={() => {setSelectType("sky")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/sky.png"/>
              </div>
              <div className={styles.name}>
                空
              </div>
            </div>
            <div className={styles.card} onClick={() => {setSelectType("sound")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/sound.png"/>
              </div>
              <div className={styles.name}>
                音源
              </div>
            </div>
            <div className={styles.card} onClick={() => {setSelectType("object")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/object.png"/>
              </div>
              <div className={styles.name}>
                3D<br/>
                オブジェクト
              </div>
            </div>
          </>
          }

          {selectType == "light" &&
          <>
            <div className={styles.card} onClick={() => {selectLight("direction")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/directionlight.png"/>
              </div>
              <div className={styles.name}>
                Direction型
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectLight("spot")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/spotlight.png"/>
              </div>
              <div className={styles.name}>
                Spot型
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectLight("point")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/pointlight.png"/>
              </div>
              <div className={styles.name}>
                Point型
              </div>
            </div>
          </>
          }

          {selectType == "sky" &&
            <>
              <div className={styles.card} onClick={() => {selectSky("blue")}} >
                <div className={styles.icon}>
                  <img className={styles.img} src="fileicons/bluesky.png"/>
                </div>
                <div className={styles.name}>
                  青空
                </div>
              </div>
            </>
          }

          {selectType == "sound" &&
            <>
              <div className={styles.dropCard} onDrop={(e) => {uploadSound(e)}} >
                <div className={styles.icon}>
                  <img className={styles.img} src="fileicons/drag-and-drop.png"/>
                </div>
                <div className={styles.name}>
                  音源をアップロード<br/>
                  もしくは、<br/>
                  コンテンツブラウザから<br/>
                  ドラッグ＆ドロップ<br/>
                </div>
              </div>
            </>
          }

          {selectType == "object" &&
          <>
            <div className={styles.card} onClick={() => {selectObj("box")}} >
              <div className={styles.objicon}>
                <AiOutlineCodeSandbox/>
              </div>
              <div className={styles.name}>
                立方体
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectObj("sphere")}} >
              <div className={styles.objicon}>
                <ImSphere/>
              </div>
              <div className={styles.name}>
                球体
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectObj("plane")}} >
              <div className={styles.objicon}>
                <BiRectangle/>
              </div>
              <div className={styles.name}>
                平面
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectObj("capsule")}} >
              <div className={styles.objicon}>
                <BiCylinder/>
              </div>
              <div className={styles.name}>
                円柱
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectLight("point")}} >
              <div className={styles.objicon}>
                <BiCapsule/>
              </div>
              <div className={styles.name}>
                カプセル型
              </div>
            </div>
          </>
          }
        </div>
      </div>
    </div>
    ,
    document.getElementById("myDialog")
  );
}

interface ISelectNewObjectDialog {
  type: "light" | "sky" | "sound" | "object";
  value: string;
}
/**
 * 新しいオブジェクトの選択ダイアログ表示
 * @returns 
 */
export const showSelectNewObjectDialog = async ():Promise<ISelectNewObjectDialog> => {
  return new Promise((resolve) => {
    const handleDialogClose = (props: ISelectNewObjectDialog) => {
      ReactDOM.unmountComponentAtNode(document.getElementById("myDialog"));
      resolve(props);
    };

    ReactDOM.render(
      <SelectNewObjectDialog response={handleDialogClose} />, document.getElementById("myDialog")
    )
  });
};