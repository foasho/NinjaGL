import { useState } from "react";
import ReactDOM from "react-dom/client";

import { OMType } from "@ninjagl/core";
import clsx from "clsx";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { AiOutlineCodeSandbox } from "react-icons/ai";
import { BiCapsule, BiCylinder, BiRectangle } from "react-icons/bi";
import { ImSphere } from "react-icons/im";
import { MdArrowLeft } from "react-icons/md";

interface IResponse {
  x?: number;
  y?: number;
  response: (data: ISelectNewObjectDialog) => void;
}
const SelectNewObjectDialog = (prop: IResponse) => {
  const [selectType, setSelectType] = useState<string | null>(null);
  const { t } = useTranslation();
  const handleClickOutside = () => {
    prop.response({ type: null, value: null });
  };
  const selectLight = (value: string) => {
    prop.response({ type: "light", value: value });
  };
  const selectSky = (value: string) => {
    prop.response({ type: "sky", value: value });
  };
  const selectThree = (value: string) => {
    prop.response({ type: "three", value: value });
  };
  const selectFog = (value: string) => {
    prop.response({ type: "fog", value: value });
  };
  const selectLightFormer = (value: string) => {
    prop.response({ type: "lightformer", value: value });
  };
  const selectCloud = (value: string) => {
    prop.response({ type: "cloud", value: value });
  };
  const selectEnvironment = (value: string) => {
    prop.response({ type: "environment", value: value });
  };
  const selectEffect = (value: string) => {
    prop.response({ type: "effect", value: value });
  };
  const selectText = (value: string) => {
    prop.response({ type: "text", value: value });
  };
  const selectText3D = (value: string) => {
    prop.response({ type: "text3d", value: value });
  };
  const selectWater = (value: string) => {
    prop.response({ type: "water", value: value });
  };
  const selectLandscape = (value: string) => {
    prop.response({ type: "landscape", value: value });
  };

  const cardStyle = "m-1 border-2 border-primary/25 hover:bg-cyber/25 px-3 py-2 cursor-pointer rounded-lg";
  const iconStyle = "text-center";
  const nameStyle = "text-center";
  const imgStyle = "w-6 h-6 m-auto";

  const styles: React.CSSProperties = { zIndex: 50 };
  if (prop.x) {
    // windowの幅よりxが大きい場合は、rightを指定する
    if (prop.x > window.innerWidth / 2) {
      styles.right = window.innerWidth - prop.x;
    } else {
      styles.left = prop.x;
    }
  }
  if (prop.y) {
    // windowの高さよりyが大きい場合は、bottomを指定する
    if (prop.y > window.innerHeight / 2) {
      styles.bottom = window.innerHeight - prop.y;
    } else {
      styles.top = prop.y;
    }
  }

  return (
    <>
      <div
        className='fixed left-0 top-0 z-10 flex h-screen w-screen items-center justify-center bg-transparent'
        onClick={handleClickOutside}
      ></div>
      <div
        className={clsx(
          "fixed z-20 min-h-[200px] min-w-[300px] max-w-[80vw] rounded-lg bg-white p-5",
          !prop.x && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        style={styles}
      >
        <div className='p-2.5'>
          {selectType && (
            <span style={{ paddingRight: "12px" }} onClick={() => setSelectType(null)}>
              <MdArrowLeft style={{ display: "inline", fontSize: "2rem" }} />
            </span>
          )}
          {t("addSelectObject")}
        </div>
        <div className='grid max-h-[50vh] grid-cols-1 gap-1 overflow-y-auto lg:grid-cols-3'>
          {selectType == null && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType("light");
                }}
              >
                <div className={nameStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/light.png' />
                </div>
                <div className='text-center'>{t("light")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType("sky");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/sky.png' />
                </div>
                <div className={nameStyle}>{t("sky")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType("cloud");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/cloud.png' />
                </div>
                <div className={nameStyle}>{t("cloud")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType("water");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src={"/fileicons/water.png"} />
                </div>
                <div className={nameStyle}>{t("landscape")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType("landscape");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src={"/fileicons/landscape.png"} />
                </div>
                <div className={nameStyle}>{t("landscape")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType("sound");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/sound.png' />
                </div>
                <div className={nameStyle}>{t("audio")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType("three");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/object.png' />
                </div>
                <div className={nameStyle}>{t("object3d")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType("text");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/text.png' />
                </div>
                <div className={nameStyle}>{t("text")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType("environment");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/environment.png' />
                </div>
                <div className={nameStyle}>{t("environment")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType("lightformer");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/lightformer.png' />
                </div>
                <div className={nameStyle}>{t("lightformer")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType("effect");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/effect.png' />
                </div>
                <div className={nameStyle}>{t("effect")}</div>
              </div>
            </>
          )}

          {selectType == "light" && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLight("directional");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/directionlight.png' />
                </div>
                <div className={nameStyle}>Directional</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLight("spot");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/spotlight.png' />
                </div>
                <div className={nameStyle}>Spot</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLight("point");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/pointlight.png' />
                </div>
                <div className={nameStyle}>Point</div>
              </div>
            </>
          )}

          {selectType == "sky" && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectSky("blue");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/bluesky.png' />
                </div>
                <div className={nameStyle}>{t("blueSky")}</div>
              </div>
            </>
          )}

          {selectType == "three" && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectThree("box");
                }}
              >
                <div className={iconStyle}>
                  <AiOutlineCodeSandbox />
                </div>
                <div className={nameStyle}>{t("box")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectThree("sphere");
                }}
              >
                <div className={iconStyle}>
                  <ImSphere />
                </div>
                <div className={nameStyle}>{t("sphere")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectThree("plane");
                }}
              >
                <div className={iconStyle}>
                  <BiRectangle />
                </div>
                <div className={nameStyle}>{t("plane")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectThree("cylinder");
                }}
              >
                <div className={iconStyle}>
                  <BiCylinder />
                </div>
                <div className={nameStyle}>{t("cylinder")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectThree("capsule");
                }}
              >
                <div className={iconStyle}>
                  <BiCapsule />
                </div>
                <div className={nameStyle}>{t("capsule")}</div>
              </div>
            </>
          )}

          {selectType == "text" && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectText("text");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/text.png' />
                </div>
                <div className={nameStyle}>{t("text")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectText3D("text3d");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/text3d.png' />
                </div>
                <div className={nameStyle}>{t("text3d")}</div>
              </div>
            </>
          )}

          {selectType == "fog" && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectFog("fog");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/fog.png' />
                </div>
                <div className={nameStyle}>{t("fog")}</div>
              </div>
            </>
          )}

          {selectType == "cloud" && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectCloud("cloud");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/cloud.png' />
                </div>
                <div className={nameStyle}>{t("cloud")}</div>
              </div>
            </>
          )}

          {selectType == "water" && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectWater("ocean");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src={"/fileicons/ocean.png"} />
                </div>
                <div className={nameStyle}>{t("water")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectWater("waterfall");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src={"/fileicons/waterfall.png"} />
                </div>
                <div className={nameStyle}>{t("water")}</div>
              </div>
            </>
          )}

          {selectType == "landscape" && (
            <>
              {/** ls1~6の6パターン選択 */}
              <div
                className={cardStyle}
                onClick={() => {
                  selectLandscape("ls1");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={128} height={128} className={imgStyle} src={"/fileicons/ls1.png"} />
                </div>
                <div className={nameStyle}>32x32</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLandscape("ls2");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={128} height={128} className={imgStyle} src={"/fileicons/ls2.png"} />
                </div>
                <div className={nameStyle}>64x64</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLandscape("ls3");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={128} height={128} className={imgStyle} src={"/fileicons/ls3.png"} />
                </div>
                <div className={nameStyle}>128x128</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLandscape("ls4");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={128} height={128} className={imgStyle} src={"/fileicons/ls4.png"} />
                </div>
                <div className={nameStyle}>256x256</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLandscape("ls5");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={128} height={128} className={imgStyle} src={"/fileicons/ls5.png"} />
                </div>
                <div className={nameStyle}>512x512</div>
              </div>
              {/** 重いので無しにする */}
              {/* <div
                className={cardStyle}
                onClick={() => {
                  selectLandscape('ls6');
                }}
              >
                <div className={iconStyle}>
                  <Image alt="" width={32} height={32} className={imgStyle} src={"/fileicons/ls6.png"} />
                </div>
                <div className={nameStyle}>1024x1024</div>
              </div> */}
            </>
          )}

          {selectType == "environment" && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectEnvironment("sunset");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/sunset.png' />
                </div>
                <div className={nameStyle}>{t("sunset")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectEnvironment("dawn");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/dawn.png' />
                </div>
                <div className={nameStyle}>{t("dawn")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectEnvironment("night");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/night.png' />
                </div>
                <div className={nameStyle}>{t("night")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectEnvironment("forest");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/forest.png' />
                </div>
                <div className={nameStyle}>{t("forest")}</div>
              </div>
            </>
          )}

          {selectType == "lightformer" && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLightFormer("circle");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/circle.png' />
                </div>
                <div className={nameStyle}>{t("circle")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLightFormer("ring");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/ring.png' />
                </div>
                <div className={nameStyle}>{t("ring")}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLightFormer("rect");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src='/fileicons/rect.png' />
                </div>
                <div className={nameStyle}>{t("rect")}</div>
              </div>
            </>
          )}

          {selectType == "effect" && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectEffect("bloom");
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src={"/fileicons/bloom.png"} />
                </div>
                <div className={nameStyle}>{t("bloom")}</div>
              </div>
              {/* SSRはバグ中 */}
              {/* <div className={styles.card} onClick={() => {selectEffect("ssr")}}>
              <div className={styles.icon}>
                <Image alt="" className={styles.img} src={"/fileicons/ssr.png"} />
              </div>
              <div className={styles.name}>
                {t("ssr")}
              </div>
            </div> */}

              {/* LUTの扱い方を検討中 */}
              {/* <div
                className={cardStyle}
                onClick={() => {
                  selectEffect('lut');
                }}
              >
                <div className={iconStyle}>
                  <Image alt='' width={32} height={32} className={imgStyle} src={'/fileicons/lut.png'} />
                </div>
                <div className={nameStyle}>{t('lut')}</div>
              </div> */}
            </>
          )}
        </div>
      </div>
    </>
  );
};

interface ISelectNewObjectDialog {
  type: OMType | null;
  value: string | null;
}
/**
 * 新しいオブジェクトの選択ダイアログ表示
 * @returns
 */
type NewObjectDialogProps = {
  x?: number;
  y?: number;
};
export const showSelectNewObjectDialog = async ({
  x = undefined,
  y = undefined,
}: NewObjectDialogProps): Promise<ISelectNewObjectDialog> => {
  return new Promise((resolve) => {
    const dialogContainer = document.getElementById("myDialog") as HTMLElement;
    const root = ReactDOM.createRoot(dialogContainer);
    const handleDialogClose = (props: ISelectNewObjectDialog) => {
      root.unmount();
      resolve(props);
    };

    root.render(<SelectNewObjectDialog x={x} y={y} response={handleDialogClose} />);
  });
};
