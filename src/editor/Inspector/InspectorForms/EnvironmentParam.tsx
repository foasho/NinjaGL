import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { useSnapshot } from 'valtio';

import { isNumber } from '@/commons/functional';
import { editorStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';
import { normalStyles } from '@/utils/styles';

export const EnvironmentParam = () => {
  const state = useSnapshot(editorStore);
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
      <div>
        <div>{t('preset')}</div>
        <div>
          <Select
            options={environmentOptions}
            value={environmentPreset}
            onChange={(select) => changeEnvironmentPreset(select)}
            styles={normalStyles}
          />
        </div>
      </div>
      <div>
        <div>{t('background')}</div>
        <div>
          <input type='checkbox' checked={background} onInput={() => onCheckEnvironmentBackGround()} />
        </div>
      </div>
      <div>
        <div>
          {t('blur')}: {blur}
        </div>
        <div>
          <input type='range' min='0' max='1' step='0.01' value={blur} defaultValue={0.5} onChange={(e) => changeEnvironmentBlur(e)} />
        </div>
      </div>
    </>
  );
};
