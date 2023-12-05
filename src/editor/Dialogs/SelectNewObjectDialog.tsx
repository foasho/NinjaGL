import { useState } from 'react';
import ReactDOM from 'react-dom/client';

import { useTranslation } from 'react-i18next';
import { AiOutlineCodeSandbox } from 'react-icons/ai';
import { BiCapsule, BiCylinder, BiRectangle } from 'react-icons/bi';
import { ImSphere } from 'react-icons/im';

interface IResponse {
  response: (data: ISelectNewObjectDialog) => void;
}
const SelectNewObjectDialog = (prop: IResponse) => {
  const [selectType, setSelectType] = useState<string | null>(null);
  const { t } = useTranslation();
  const handleClickOutside = (event) => {
    prop.response({ type: null, value: null });
  };
  const selectUI = (value: string) => {
    prop.response({ type: 'ui', value: value });
  };
  const selectLight = (value: string) => {
    prop.response({ type: 'light', value: value });
  };
  const selectSky = (value: string) => {
    prop.response({ type: 'sky', value: value });
  };
  const selectThree = (value: string) => {
    prop.response({ type: 'three', value: value });
  };
  const selectFog = (value: string) => {
    prop.response({ type: 'fog', value: value });
  };
  // カメラは１つしかつかえないようにする
  // const selectCamera = (value: string) => {
  //   prop.response({ type: "camera", value: value });
  // }
  const selectLightFormer = (value: string) => {
    prop.response({ type: 'lightformer', value: value });
  };
  const selectCloud = (value: string) => {
    prop.response({ type: 'cloud', value: value });
  };
  const selectEnvironment = (value: string) => {
    prop.response({ type: 'environment', value: value });
  };
  const selectEffect = (value: string) => {
    prop.response({ type: 'effect', value: value });
  };
  const selectXR = (value: string) => {
    prop.response({ type: 'xr', value: value });
  };
  const uploadSound = (e) => {
    console.log('サウンドがアップロードされました');
    console.log(e);
  };

  const cardStyle = 'm-2.5 border-2 border-primary/25 px-3 py-2 cursor-pointer rounded-2xl';
  const iconStyle = 'text-center';
  const nameStyle = 'text-center';
  const imgStyle = 'w-6 h-6 m-auto';

  return (
    <>
      <div
        className='fixed left-0 top-0 z-10 flex h-screen w-screen items-center justify-center bg-black/50'
        onClick={handleClickOutside}
      ></div>
      <div className='fixed left-1/2 top-1/2 z-20 min-h-[200px] min-w-[300px] max-w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5'>
        <div className='p-2.5'>{t('addSelectObject')}</div>
        <div className='grid max-h-[70vh] grid-cols-3 gap-4'>
          {selectType == null && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType('light');
                }}
              >
                <div className={nameStyle}>
                  <img className={imgStyle} src='fileicons/light.png' />
                </div>
                <div className='text-center'>{t('light')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType('sky');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/sky.png' />
                </div>
                <div className={nameStyle}>{t('sky')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType('cloud');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/cloud.png' />
                </div>
                <div className={nameStyle}>{t('cloud')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType('sound');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/sound.png' />
                </div>
                <div className={nameStyle}>{t('audio')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType('three');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/object.png' />
                </div>
                <div className={nameStyle}>{t('object3d')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType('ui');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/ui.png' />
                </div>
                <div className={nameStyle}>{t('ui')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType('environment');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/environment.png' />
                </div>
                <div className={nameStyle}>{t('environment')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType('lightformer');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/lightformer.png' />
                </div>
                <div className={nameStyle}>{t('lightformer')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  setSelectType('effect');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/effect.png' />
                </div>
                <div className={nameStyle}>{t('effect')}</div>
              </div>
            </>
          )}

          {selectType == 'light' && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLight('directional');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/directionlight.png' />
                </div>
                <div className={nameStyle}>Directional</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLight('spot');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/spotlight.png' />
                </div>
                <div className={nameStyle}>Spot</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLight('point');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/pointlight.png' />
                </div>
                <div className={nameStyle}>Point</div>
              </div>
            </>
          )}

          {selectType == 'sky' && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectSky('blue');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/bluesky.png' />
                </div>
                <div className={nameStyle}>{t('blueSky')}</div>
              </div>
            </>
          )}

          {selectType == 'three' && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectThree('box');
                }}
              >
                <div className={iconStyle}>
                  <AiOutlineCodeSandbox />
                </div>
                <div className={nameStyle}>{t('box')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectThree('sphere');
                }}
              >
                <div className={iconStyle}>
                  <ImSphere />
                </div>
                <div className={nameStyle}>{t('sphere')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectThree('plane');
                }}
              >
                <div className={iconStyle}>
                  <BiRectangle />
                </div>
                <div className={nameStyle}>{t('plane')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectThree('cylinder');
                }}
              >
                <div className={iconStyle}>
                  <BiCylinder />
                </div>
                <div className={nameStyle}>{t('cylinder')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectThree('capsule');
                }}
              >
                <div className={iconStyle}>
                  <BiCapsule />
                </div>
                <div className={nameStyle}>{t('capsule')}</div>
              </div>
            </>
          )}

          {selectType == 'ui' && <>{/** 設計中 */}</>}

          {selectType == 'fog' && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectFog('fog');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/fog.png' />
                </div>
                <div className={nameStyle}>{t('fog')}</div>
              </div>
            </>
          )}

          {selectType == 'cloud' && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectCloud('cloud');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='fileicons/cloud.png' />
                </div>
                <div className={nameStyle}>{t('cloud')}</div>
              </div>
            </>
          )}

          {selectType == 'environment' && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectEnvironment('sunset');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='/fileicons/sunset.png' />
                </div>
                <div className={nameStyle}>{t('sunset')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectEnvironment('dawn');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='/fileicons/dawn.png' />
                </div>
                <div className={nameStyle}>{t('dawn')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectEnvironment('night');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='/fileicons/night.png' />
                </div>
                <div className={nameStyle}>{t('night')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectEnvironment('forest');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='/fileicons/forest.png' />
                </div>
                <div className={nameStyle}>{t('forest')}</div>
              </div>
            </>
          )}

          {selectType == 'lightformer' && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLightFormer('circle');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='/fileicons/circle.png' />
                </div>
                <div className={nameStyle}>{t('circle')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLightFormer('ring');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='/fileicons/ring.png' />
                </div>
                <div className={nameStyle}>{t('ring')}</div>
              </div>
              <div
                className={cardStyle}
                onClick={() => {
                  selectLightFormer('rect');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src='/fileicons/rect.png' />
                </div>
                <div className={nameStyle}>{t('rect')}</div>
              </div>
            </>
          )}

          {selectType == 'effect' && (
            <>
              <div
                className={cardStyle}
                onClick={() => {
                  selectEffect('bloom');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src={'fileicons/bloom.png'} />
                </div>
                <div className={nameStyle}>{t('bloom')}</div>
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
              <div
                className={cardStyle}
                onClick={() => {
                  selectEffect('lut');
                }}
              >
                <div className={iconStyle}>
                  <img className={imgStyle} src={'fileicons/lut.png'} />
                </div>
                <div className={nameStyle}>{t('lut')}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

interface ISelectNewObjectDialog {
  type:
    | 'light'
    | 'sky'
    | 'sound'
    | 'object'
    | 'three'
    | 'xr'
    | 'ui'
    | 'camera'
    | 'fog'
    | 'cloud'
    | 'environment'
    | 'lightformer'
    | 'effect'
    | null;
  value: string | null;
}
/**
 * 新しいオブジェクトの選択ダイアログ表示
 * @returns
 */
export const showSelectNewObjectDialog = async (): Promise<ISelectNewObjectDialog> => {
  return new Promise((resolve) => {
    const dialogContainer = document.getElementById('myDialog') as HTMLElement;
    const root = ReactDOM.createRoot(dialogContainer);
    const handleDialogClose = (props: ISelectNewObjectDialog) => {
      root.unmount();
      resolve(props);
    };

    root.render(<SelectNewObjectDialog response={handleDialogClose} />);
  });
};
