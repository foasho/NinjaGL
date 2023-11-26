import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { useSnapshot } from 'valtio';

import styles from '@/App.module.scss';
import { isNumber } from '@/commons/functional';
import { globalStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';
import { normalStyles } from '@/utils/styles';

export const EnvironmentParam = () => {
  const state = useSnapshot(globalStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

  // Environmentの設定
  const [background, setBackground] = useState<boolean>(true);
  const [blur, setBlur] = useState<number>(0.5);
  const [environmentPreset, setEnvironmentPreset] = useState<{
    value: 'forest' | 'sunset' | 'dawn' | 'night';
    label: string;
  }>();

  // Environmentの選択肢
  const environmentOptions: { value: 'sunset' | 'dawn' | 'night' | 'forest'; label: string }[] = [
    { value: 'sunset', label: t('sunset') },
    { value: 'dawn', label: t('dawn') },
    { value: 'night', label: t('night') },
    { value: 'forest', label: t('forest') },
  ];

  useEffect(() => {
    if (om) {
      if (om.args.backgroud !== undefined) setBackground(om.args.backgroud);
      if (om.args.blur) setBlur(om.args.blur);
      if (om.args.preset) setEnvironmentPreset(environmentOptions.find((option) => option.value == om.args.preset));
    }
  }, [om]);

  /**
   * EnvironmentのPresetを変更
   */
  const changeEnvironmentPreset = (selectEnvironmentPreset) => {
    if (id) editor.setArg(id, 'preset', selectEnvironmentPreset.value);
    setEnvironmentPreset(selectEnvironmentPreset);
  };

  /**
   * EnvironmentのBlurの変更
   */
  const changeEnvironmentBlur = (e) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, 'blur', Number(targetValue));
      setBlur(Number(targetValue));
    }
  };

  /**
   * Helper表示切り替え
   */
  const onCheckEnvironmentBackGround = () => {
    if (id) editor.setArg(id, 'background', !background);
    setBackground(!background);
  };

  return (
    <>
      <div className={styles.preset}>
        <div className={styles.title}>{t('preset')}</div>
        <div className={styles.input}>
          <Select
            options={environmentOptions}
            value={environmentPreset}
            onChange={(select) => changeEnvironmentPreset(select)}
            styles={normalStyles}
          />
        </div>
      </div>
      <div className={styles.backgroud}>
        <div className={styles.title}>{t('background')}</div>
        <div className={styles.input}>
          <input
            type='checkbox'
            className={styles.checkbox}
            checked={background}
            onInput={() => onCheckEnvironmentBackGround()}
          />
          <span className={styles.customCheckbox}></span>
        </div>
      </div>
      <div className={styles.blur}>
        <div className={styles.title}>
          {t('blur')}: {blur}
        </div>
        <div className={styles.input}>
          <input type='range' min='0' max='1' step='0.01' value={blur} onChange={(e) => changeEnvironmentBlur(e)} />
        </div>
      </div>
    </>
  );
};
