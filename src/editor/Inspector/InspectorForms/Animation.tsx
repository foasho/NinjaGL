import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { AnimationClip } from 'three';
import { useSnapshot } from 'valtio';

import styles from '@/App.module.scss';
import { globalStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';
import { normalStyles } from '@/utils/styles';

export const Animation = () => {
  const state = useSnapshot(globalStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

  // Animationsの設定
  const [defalutAnim, setDefalutAnim] = useState<{ value: string; label: string }>();
  const [animLoop, setAnimLoop] = useState<boolean>(true);

  useEffect(() => {
    if (om) {
      if (om.args.defaultAnim) setDefalutAnim(om.args.defaultAnim);
      if (om.args.animLoop !== undefined) setAnimLoop(om.args.animLoop);
    }
  }, [om]);

  /**
   * デフォルトアニメーションの変更
   */
  const changeDefaultAnimation = (selectDefaultAnimation) => {
    if (id) editor.setArg(id, 'defaultAnimation', selectDefaultAnimation.value);
    setDefalutAnim(selectDefaultAnimation);
  };

  /**
   * アニメーションループの切り替え
   */
  const onCheckAnimationLoop = () => {
    if (id) editor.setArg(id, 'animationLoop', !animLoop);
    setAnimLoop(!animLoop);
  };

  return (
    <>
      <div className={styles.animations}>
        {om && om.animations && om.animations.length > 0 && (
          <>
            <div className={styles.title}>{t('animations')}</div>
            <div className={styles.input}>
              <Select
                options={om.animations.map((anim: AnimationClip) => {
                  return { value: anim.name, label: anim.name };
                })}
                value={defalutAnim}
                onChange={(select) => changeDefaultAnimation(select)}
                styles={normalStyles}
              />
            </div>
          </>
        )}
      </div>
      <div className={styles.animLoop}>
        <div className={styles.title}>{t('animationLoop')}</div>
        <div className={styles.input}>
          <input
            type='checkbox'
            className={styles.checkbox}
            checked={animLoop}
            onInput={() => onCheckAnimationLoop()}
          />
          <span className={styles.customCheckbox}></span>
        </div>
      </div>
    </>
  );
};
