import styles from "@/App.module.scss";
import { useState } from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { AiOutlineCodeSandbox } from "react-icons/ai";
import { BiCapsule, BiCylinder, BiRectangle } from "react-icons/bi";
import { ImSphere } from "react-icons/im";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

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
  const selectUI = (value: string) => {
    prop.response({ type: "ui", value: value });
  }
  const selectLight = (value: string) => {
    prop.response({ type: "light", value: value });
  }
  const selectSky = (value: string) => {
    prop.response({ type: "sky", value: value });
  }
  const selectThree = (value: string) => {
    prop.response({ type: "three", value: value });
  }
  const selectFog = (value: string) => {
    prop.response({ type: "fog", value: value });
  }
  const selectCamera = (value: string) => {
    prop.response({ type: "camera", value: value });
  }
  const selectLightFormer = (value: string) => {
    prop.response({ type: "lightformer", value: value });
  }
  const selectCloud = (value: string) => {
    prop.response({ type: "cloud", value: value });
  }
  const selectEnvironment = (value: string) => {
    prop.response({ type: "environment", value: value });
  }
  const selectEffect = (value: string) => {
    prop.response({ type: "effect", value: value });
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
            <div className={styles.card} onClick={() => {setSelectType("cloud")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/cloud.png"/>
              </div>
              <div className={styles.name}>
                {t("cloud")}
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
            <div className={styles.card} onClick={() => {setSelectType("ui")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/ui.png"/>
              </div>
              <div className={styles.name}>
                {t("ui")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {setSelectType("camera")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/camera.png"/>
              </div>
              <div className={styles.name}>
                {t("camera")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {setSelectType("environment")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/environment.png"/>
              </div>
              <div className={styles.name}>
                {t("environment")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {setSelectType("lightformer")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/lightformer.png"/>
              </div>
              <div className={styles.name}>
                {t("lightformer")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {setSelectType("effect")}} >
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/effect.png"/>
              </div>
              <div className={styles.name}>
                {t("effect")}
              </div>
            </div>
          </>
          }

          {selectType == "light" &&
          <>
            <div className={styles.card} onClick={() => {selectLight("directional")}} >
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

          {selectType == "ui" &&
          <>
            <div className={styles.card} onClick={() => {selectUI("touchController")}}>
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/touchController.png"/>
              </div>
              <div className={styles.name}>
                {t("touchController")}
              </div>
            </div>
          </>
          }

          {selectType == "fog" &&
          <>
            <div className={styles.card} onClick={() => {selectFog("fog")}}>
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/fog.png"/>
              </div>
              <div className={styles.name}>
                {t("fog")}
              </div>
            </div>
          </>
          }


          {selectType == "camera" &&
          <>
            <div className={styles.card} onClick={() => {selectCamera("fixed")}}>
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/fixed-camera.png"/>
              </div>
              <div className={styles.name}>
                {t("fixedCamera")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectCamera("moveable")}}>
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/moveable-camera.png"/>
              </div>
              <div className={styles.name}>
                {t("moveableCamera")}
              </div>
            </div>
          </>
        }

        {selectType == "cloud" &&
          <>
            <div className={styles.card} onClick={() => {selectCloud("cloud")}}>
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/cloud.png"/>
              </div>
              <div className={styles.name}>
                {t("cloud")}
              </div>
            </div>
          </>
        }

        {selectType == "environment" &&
          <>
            <div className={styles.card} onClick={() => {selectEnvironment("sunset")}}>
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/sunset.png"/>
              </div>
              <div className={styles.name}>
                {t("sunset")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectEnvironment("dawn")}}>
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/dawn.png"/>
              </div>
              <div className={styles.name}>
                {t("dawn")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectEnvironment("night")}}>
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/night.png"/>
              </div>
              <div className={styles.name}>
                {t("night")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectEnvironment("forest")}}>
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/forest.png"/>
              </div>
              <div className={styles.name}>
                {t("forest")}
              </div>
            </div>
          </>
        }

        {selectType == "lightformer" &&
          <>
            <div className={styles.card} onClick={() => {selectLightFormer("circle")}}>
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/circle.png"/>
              </div>
              <div className={styles.name}>
                {t("circle")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectLightFormer("ring")}}>
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/ring.png"/>
              </div>
              <div className={styles.name}>
                {t("ring")}
              </div>
            </div>
            <div className={styles.card} onClick={() => {selectLightFormer("rect")}}>
              <div className={styles.icon}>
                <img className={styles.img} src="fileicons/rect.png"/>
              </div>
              <div className={styles.name}>
                {t("rect")}
              </div>
            </div>
          </>
        }

        {selectType == "effect" &&
          <>
            <div className={styles.card} onClick={() => {selectEffect("bloom")}}>
              <div className={styles.icon}>
                <img className={styles.img} src={"fileicons/bloom.png"} />
              </div>
              <div className={styles.name}>
                {t("bloom")}
              </div>
            </div>
            {/* SSRはバグ中 */}
            {/* <div className={styles.card} onClick={() => {selectEffect("ssr")}}>
              <div className={styles.icon}>
                <img className={styles.img} src={"fileicons/ssr.png"} />
              </div>
              <div className={styles.name}>
                {t("ssr")}
              </div>
            </div> */}
            <div className={styles.card} onClick={() => {selectEffect("lut")}}>
              <div className={styles.icon}>
                <img className={styles.img} src={"fileicons/lut.png"} />
              </div>
              <div className={styles.name}>
                {t("lut")}
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
  type: "light" | "sky" | "sound" | "object" | "three" 
    | "ui" | "camera" | "fog" | "cloud" | "environment" | "lightformer" | "effect";
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