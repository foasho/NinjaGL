import { ChangeEvent, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useSnapshot } from 'valtio';

import { isNumber } from '@/commons/functional';
import { editorStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

export const ViewableDistance = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

  const [distance, setDistance] = useState<number>(25);

  useEffect(() => {
    if (om && om.args.distance) setDistance(om.args.distance);
  }, [om]);

  /**
   * Distanceの変更
   */
  const changeDistance = (e: ChangeEvent<HTMLInputElement>) => {
    const targetValue = e.target.value;
    if (isNumber(targetValue) && id) {
      editor.setArg(id, 'distance', Number(targetValue));
      setDistance(Number(targetValue));
    }
  };

  return (
    <div>
      <div>
        {t('distance')}: {distance}
      </div>
      <div>
        <input type={'range'} min={0} max={10} step={0.01} value={distance} onChange={(e) => changeDistance(e)} />
      </div>
    </div>
  );
};
