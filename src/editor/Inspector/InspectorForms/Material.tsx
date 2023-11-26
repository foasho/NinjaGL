import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { useSnapshot } from 'valtio';

import styles from '@/App.module.scss';
import { globalStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';
import { normalStyles } from '@/utils/styles';

export const Material = () => {
  const state = useSnapshot(globalStore);
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const id = state.currentId;
  const om = editor.getOMById(id);
  const [materialType, setMaterialType] = useState<{
    value: 'standard' | 'phong' | 'toon' | 'shader' | 'reflection';
    label: string;
  }>();
  const [materialColor, setMaterialColor] = useState<string>();

  useEffect(() => {
    if (om) {
      if (om.args.materialData !== undefined) {
        setMaterialType(materialOptions.find((option) => option.value == om.args.materialData.type));
      } else {
        setMaterialType(materialOptions.find((option) => option.value == 'standard'));
        setMaterialColor('#ffffff');
      }
      if (om.args.materialData !== undefined && om.args.materialData.value)
        setMaterialColor(om.args.materialData.value);
    }
  }, [om]);

  // マテリアル種別の選択肢
  const materialOptions: { value: 'standard' | 'phong' | 'toon' | 'shader' | 'reflection'; label: string }[] = [
    { value: 'standard', label: t('StandardMaterial') },
    { value: 'phong', label: t('PhongMaterial') },
    { value: 'toon', label: t('ToonMaterial') },
    { value: 'shader', label: t('ShaderMaterial') },
    { value: 'reflection', label: t('reflection') },
  ];

  /**
   * マテリアル(種別/色)の変更
   */
  const changeMaterial = (type: 'shader' | 'standard' | 'phong' | 'toon' | 'reflection', value: any) => {
    if (type !== 'shader' && value && id) {
      editor.setMaterialData(id, type, value);
      setMaterialColor(value);
      setMaterialType(materialOptions.find((option) => option.value == type));
    }
  };

  return (
    <div className={styles.material}>
      <div className={styles.title}>{t('materialConfig')}</div>
      <div className={styles.type}>
        <div className={styles.title}>{t('type')}</div>
        <div className={styles.input}>
          <Select
            options={materialOptions}
            value={materialType}
            onChange={(select) => select && changeMaterial(select.value, materialColor)}
            styles={normalStyles}
          />
        </div>
      </div>
      {materialType && materialType.value !== 'shader' && (
        <div className={styles.color}>
          <div className={styles.name}>{t('color')}</div>
          <div className={styles.pallet}>
            <input
              type={'color'}
              value={materialColor}
              onChange={(e) => changeMaterial(materialType.value, e.target.value)}
              onFocus={() => (globalStore.editorFocus = true)}
              onBlur={() => (globalStore.editorFocus = false)}
            />
            <input type={'text'} value={materialColor} />
          </div>
        </div>
      )}
    </div>
  );
};
