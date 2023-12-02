import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSnapshot } from 'valtio';

import styles from '@/App.module.scss';
import { globalStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

export const Shadows = () => {
  const state = useSnapshot(globalStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

  const [castShadow, setCastShadow] = useState<boolean>(true);
  const [receiveShadow, setReceiveShadow] = useState<boolean>(false);

  useEffect(() => {
    if (om) {
      setCastShadow(om.args.castShadow);
      setReceiveShadow(om.args.receiveShadow);
    }
  }, [om]);

  /**
   * CastShadowを変更
   */
  const onCheckCastShadow = () => {
    if (id) editor.setArg(id, 'castShadow', !castShadow);
    setCastShadow(!castShadow);
  };

  /**
   * receiveShadowを変更
   */
  const onCheckReceiveShadow = () => {
    if (id) editor.setArg(id, 'receiveShadow', !receiveShadow);
    setReceiveShadow(!receiveShadow);
  };

  return (
    <>
      <div className='mt-2'>
        <div className='inline-block px-0.5 text-lg font-bold'>{t('castshadow')}</div>
        <div className='inline-block pl-3'>
          <input
            type='checkbox'
            className='scale-125 cursor-pointer align-middle accent-[#43D9D9]'
            checked={castShadow}
            onInput={() => onCheckCastShadow()}
          />
        </div>
      </div>
      <div className='mt-2'>
        <div className='inline-block px-0.5 text-lg font-bold'>{t('receiveshadow')}</div>
        <div className='inline-block pl-3'>
          <input
            type='checkbox'
            className='scale-125 cursor-pointer align-middle accent-[#43D9D9]'
            checked={receiveShadow}
            onInput={() => onCheckReceiveShadow()}
          />
        </div>
      </div>
    </>
  );
};
