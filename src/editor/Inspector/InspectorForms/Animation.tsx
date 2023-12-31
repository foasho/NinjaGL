import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { AnimationClip } from 'three';
import { useSnapshot } from 'valtio';

import { editorStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';
import { normalStyles } from '@/utils/styles';

export const Animation = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = editor.getOMById(id);

  // Animationsの設定
  const [defalutAnim, setDefalutAnim] = useState<{ value: string; label: string }>(
    om?.args.defaultAnim ? { value: om.args.defaultAnim, label: om.args.defaultAnim } : { value: '', label: '' },
  );
  const [animLoop, setAnimLoop] = useState<boolean>(om?.args.animationLoop);

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
      <div>
        {om && om.args.animations && om.args.animations.length > 0 && (
          <>
            <div>{t('animations')}</div>
            <div>
              <Select
                options={om.args.animations.map((anim: AnimationClip) => {
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
      <div className='mt-2'>
        <div className='inline-block px-0.5 text-lg font-bold'>{t('animationLoop')}</div>
        <div className='inline-block pl-3'>
          <input
            type='checkbox'
            checked={animLoop}
            onInput={() => onCheckAnimationLoop()}
            className='scale-125 cursor-pointer align-middle accent-[#43D9D9]'
            defaultChecked={false}
          />
        </div>
      </div>
    </>
  );
};
