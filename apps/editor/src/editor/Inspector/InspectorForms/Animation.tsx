import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import Select from "react-select";
import type { AnimationClip } from "three";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { normalStyles } from "@/utils/styles";

interface AnimationSelectProps {
  label: string;
  value: string;
}
export const Animation = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const editor = useNinjaEditor();
  const { t } = useTranslation();
  const om = id?editor.getOMById(id): null;

  // Animationsの設定
  const [defalutAnim, setDefalutAnim] = useState<AnimationSelectProps>({ value: "", label: "" });
  const [animLoop, setAnimLoop] = useState<boolean>(om?.args.animationLoop? om.args.animationLoop: false);

  useEffect(() => {
    if (om) {
      if (om.args.defaultAnim) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        setDefalutAnim({ value: om.args.defaultAnim, label: om.args.defaultAnim });
      }
      if (om.args.animLoop !== undefined) setAnimLoop(om.args.animationLoop? om.args.animationLoop: false);
    }
  }, [om]);

  /**
   * デフォルトアニメーションの変更
   */
  const changeDefaultAnimation = (selectDefaultAnimation: AnimationSelectProps) => {
    if (id) editor.setArg(id, "defaultAnimation", selectDefaultAnimation.value);
    setDefalutAnim(selectDefaultAnimation);
  };

  /**
   * アニメーションループの切り替え
   */
  const onCheckAnimationLoop = () => {
    if (id) editor.setArg(id, "animationLoop", !animLoop);
    setAnimLoop(!animLoop);
  };

  return (
    <>
      <div>
        {om && om.args.animations && om.args.animations.length > 0 && (
          <>
            <div>{t("animations")}</div>
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
        <div className='inline-block px-0.5 text-lg font-bold'>{t("animationLoop")}</div>
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
