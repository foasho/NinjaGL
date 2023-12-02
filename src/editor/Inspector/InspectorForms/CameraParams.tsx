import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSnapshot } from 'valtio';

import { isNumber } from '@/commons/functional';
import { globalStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

export const CameraParams = () => {
  const state = useSnapshot(globalStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);
  // カメラの設定
  const [fov, setFov] = useState<number>(50);
  const [near, setNear] = useState<number>(0.1);
  const [far, setFar] = useState<number>(1000);

  useEffect(() => {
    if (om) {
      if (om.args.fov) setFov(om.args.fov);
      if (om.args.near) setNear(om.args.near);
      if (om.args.far) setFar(om.args.far);
    }
  }, [om]);

  /**
   * Camera-Fovの変更
   */
  const changeCameraFov = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, 'fov', Number(targetValue));
      setFov(Number(targetValue));
    }
  };
  /**
   * Camera-Nearの変更
   */
  const changeCameraNear = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, 'near', Number(targetValue));
      setNear(Number(targetValue));
    }
  };
  /**
   * Camera-Farの変更
   */
  const changeCameraFar = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, 'far', Number(targetValue));
      setFar(Number(targetValue));
    }
  };

  return (
    <>
      <div>
        <div>
          {t('fov')}: {fov}
        </div>
        <div>
          <input type={'range'} min={0} max={180} step={0.01} value={fov} onChange={(e) => changeCameraFov(e)} />
        </div>
      </div>
      <div>
        <div>
          {t('near')}: {near}
        </div>
        <div>
          <input type={'range'} min={0} max={10} step={0.01} value={near} onChange={(e) => changeCameraNear(e)} />
        </div>
      </div>
      <div>
        <div>
          {t('far')}: {far}
        </div>
        <div>
          <input type={'range'} min={0} max={100} step={0.01} value={far} onChange={(e) => changeCameraFar(e)} />
        </div>
      </div>
    </>
  );
};
