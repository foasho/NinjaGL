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
    if (om){
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
      <div className={styles.castShadow}>
        <div className={styles.title}>{t('castshadow')}</div>
        <div className={styles.input}>
          <input type='checkbox' className={styles.checkbox} checked={castShadow} onInput={() => onCheckCastShadow()} />
          <span className={styles.customCheckbox}></span>
        </div>
      </div>
      <div className={styles.castShadow}>
        <div className={styles.title}>{t('receiveshadow')}</div>
        <div className={styles.input}>
          <input
            type='checkbox'
            className={styles.checkbox}
            checked={receiveShadow}
            onInput={() => onCheckReceiveShadow()}
          />
          <span className={styles.customCheckbox}></span>
        </div>
      </div>
    </>
  );
};
