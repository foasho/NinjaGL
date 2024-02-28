import { useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { OMPhysicsType } from "@ninjagl/core";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

export const Physics = () => {
  const state = useSnapshot(editorStore);
  const id = state.currentId;
  const { getOMById, setPhyType, setPhysics, setMoveable } = useNinjaEditor();
  const { t } = useTranslation();
  const om = getOMById(id);

  const [isPhysics, setIsPhysics] = useState(om?.physics);
  const [isMoveable, setIsMoveable] = useState(om?.moveable);
  // 物理判定選択肢
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const physicsOptions: { value: OMPhysicsType; label: string }[] = [
    { value: "box", label: t("box") },
    { value: "capsule", label: t("capsule") },
    { value: "sphere", label: t("sphere") },
  ];
  const opt = physicsOptions.find((option) => option.value == om?.phyType);
  const [phyTypeOpt, setPhyTypeOpt] = useState<{ value: OMPhysicsType; label: string }>(opt ?? physicsOptions[0]);

  /**
   * 物理判定の有無
   */
  const onChangePhysics = () => {
    setIsPhysics(!isPhysics);
    if (id) setPhysics(id, !isPhysics);
  };

  /**
   * 物理判定種別の変更
   * @param selectPhysics
   */
  const onChangePhyType = (selectPhysics) => {
    setPhyTypeOpt(selectPhysics);
    const pt = selectPhysics.value as OMPhysicsType;
    if (id) setPhyType(id, pt);
  };

  /**
   * 移動可能の有無
   */
  const onChangeMoveable = () => {
    setIsMoveable(!isMoveable);
    if (id) setMoveable(id, !isMoveable);
  };

  return (
    <>
      <div className='mt-2'>
        <div className='inline-block px-0.5 py-1.5 text-lg font-bold'>{t("isPhysics")}</div>
        <div className='inline-block pl-3'>
          <input
            type='checkbox'
            className='scale-125 cursor-pointer align-middle accent-[#43D9D9]'
            checked={isPhysics}
            onChange={() => onChangePhysics()}
          />
        </div>
        {isPhysics && (
          <>
            <Select options={physicsOptions} value={phyTypeOpt} onChange={onChangePhyType} />
            <div>
              <div className='inline-block py-1.5 pl-3 font-bold'>{t("isMoveable")}</div>
              <div className='inline-block pl-3'>
                <input
                  type='checkbox'
                  className='scale-125 cursor-pointer align-middle accent-[#43D9D9]'
                  checked={isMoveable}
                  onChange={() => onChangeMoveable()}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
