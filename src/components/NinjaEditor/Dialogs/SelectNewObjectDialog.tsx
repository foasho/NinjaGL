import styles from "@/App.module.scss";
import { useState } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { AiOutlineCodeSandbox } from "react-icons/ai";
import { BiCapsule, BiCylinder, BiRectangle } from "react-icons/bi";
import { ImSphere } from "react-icons/im";

interface IResponse {
  response: (data: ISelectNewObjectDialog) => void;
}
const SelectNewObjectDialog = (prop: IResponse) => {
  const [selectType, setSelectType] = useState<string>(null);
  const { t } = useTranslation();
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
  const selectThree = (value: string) => {
    prop.response({ type: "three", value: value });
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
          {t("addSelectObject")}
        </div>
        <div className={styles.cards}>
          {selectType == null &&
          <>
            <div className={styles.card} onClick={() => {setSelectType("light")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/light.png"/>
              </div>
              <div className={styles.name}>
                {t("light")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {setSelectType("sky")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/sky.png"/>
              </div>
              <div className={styles.name}>
                {t("sky")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {setSelectType("sound")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/sound.png"/>
              </div>
              <div className={styles.name}>
                {t("audio")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {setSelectType("three")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/object.png"/>
              </div>
              <div className={styles.name}>
                {t("object3d")}
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
                Directional
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectLight("spot")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/spotlight.png"/>
              </div>
              <div className={styles.name}>
                Spot
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectLight("point")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/pointlight.png"/>
              </div>
              <div className={styles.name}>
                Point
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
                  {t("blueSky")}
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
                  {t("uploadAudio")}
                </div>
              </div>
            </>
          }

          {selectType == "three" &&
          <>
            <div className={styles.card} onClick={() => {selectThree("box")}} >
              <div className={styles.objicon}>
                <AiOutlineCodeSandbox/>
              </div>
              <div className={styles.name}>
                {t("box")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectThree("sphere")}} >
              <div className={styles.objicon}>
                <ImSphere/>
              </div>
              <div className={styles.name}>
                {t("sphere")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectThree("plane")}} >
              <div className={styles.objicon}>
                <BiRectangle/>
              </div>
              <div className={styles.name}>
                {t("plane")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectThree("cylinder")}} >
              <div className={styles.objicon}>
                <BiCylinder/>
              </div>
              <div className={styles.name}>
                {t("cylinder")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectThree("capsule")}} >
              <div className={styles.objicon}>
                <BiCapsule/>
              </div>
              <div className={styles.name}>
                {t("capsule")}
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
  type: "light" | "sky" | "sound" | "object" | "three";
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