import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { useSnapshot } from 'valtio';

import styles from '@/App.module.scss';
import { globalStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';
import { normalStyles } from '@/utils/styles';

export const Physics = () => {
  const state = useSnapshot(globalStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

  const [isPhysics, setIsPhysics] = useState<boolean>(false);

  const [physics, setPhysics] = useState<{ value: string; label: string }>();

  useEffect(() => {
    if (om && om.args.physics) setIsPhysics(om.args.physics);
  }, [om]);

  /**
   * 物理判定の有無
   * @param selectPhysics
   */
  const onChangePhysics = (selectPhysics) => {
    setPhysics(selectPhysics);
  };

  // 物理判定選択肢
  const physicsOptions = [
    { value: 'aabb', label: t('aabb') },
    { value: 'along', label: t('along') },
  ];

  return (
    <>
      <div className={styles.physics}>
        <div className={styles.title}>{t('isPhysics')}</div>
        <div className={styles.input}>
          <input
            type='checkbox'
            className={styles.checkbox}
            checked={isPhysics}
            onInput={() => setIsPhysics(!isPhysics)}
          />
          <span className={styles.customCheckbox}></span>
        </div>
        {isPhysics && (
          <>
            <Select options={physicsOptions} value={physics} onChange={onChangePhysics} styles={normalStyles} />
          </>
        )}
      </div>
    </>
  );
};
