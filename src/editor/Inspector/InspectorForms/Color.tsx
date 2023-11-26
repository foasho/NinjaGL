import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSnapshot } from 'valtio';

import styles from '@/App.module.scss';
import { globalStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

export const Color = () => {
  const state = useSnapshot(globalStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const om = editor.getOMById(id);
  const { t } = useTranslation();

  const [color, setColor] = useState<string>();

  useEffect(() => {
    if (om && om.args.color) setColor(om.args.color);
  }, [om]);

  /**
   * 色属性の変更
   */
  const changeColor = (e) => {
    if (id) {
      editor.setArg(id, 'color', e.target.value);
    }
    setColor(e.target.value);
  };

  return (
    <div className={styles.color}>
      <div className={styles.name}>{t('color')}</div>
      <div className={styles.pallet}>
        <input
          type={'color'}
          value={color}
          onChange={(e) => changeColor(e)}
          onFocus={() => (globalStore.editorFocus = true)}
          onBlur={() => (globalStore.editorFocus = false)}
        />
        <input type={'text'} value={color} />
      </div>
    </div>
  );
};
