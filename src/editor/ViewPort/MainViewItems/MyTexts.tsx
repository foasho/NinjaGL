import { memo, useEffect, useRef, useState } from "react";
import { IObjectManagement } from "@ninjagl/core";
import { Text, useHelper } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { BoxHelper, MeshStandardMaterial } from "three";
import { useSnapshot } from "valtio";

import { EnableClickTrigger } from "@/commons/functional";
import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

const _MyTexts = () => {
  const { oms, onOMsChanged, offOMsChanged } = useNinjaEditor();
  const [texts, setTexts] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    const update = () => {
      const _texts = oms.current.filter((om) => om.type == "text");
      setTexts(_texts);
    };
    update();
    onOMsChanged(update);
    return () => {
      offOMsChanged(update);
    };
  }, [offOMsChanged, oms, onOMsChanged]);

  return (
    <>
      {texts.map((om) => {
        return <MyText om={om} key={om.id} />;
      })}
    </>
  );
};

const _Text = ({ om }) => {
  const ref = useRef<any>();
  const { camera } = useThree();
  const font = om.args.font || "/fonts/MPLUS.ttf";
  const state = useSnapshot(editorStore);
  const matRef = useRef<MeshStandardMaterial>(null);
  const { onOMIdChanged, offOMIdChanged, pivotRef } = useNinjaEditor();
  const [helper, setHelper] = useState<boolean>(false);
  const id = om.id;

  useEffect(() => {
    const init = () => {
      if (ref.current) {
        if (om.args.position) {
          ref.current.position.copy(om.args.position);
        }
        if (om.args.rotation) {
          ref.current.rotation.copy(om.args.rotation);
        }
        if (om.args.scale) {
          ref.current.scale.copy(om.args.scale);
        }
        if (om.args.helper !== undefined) setHelper(om.args.helper);
      }
      if (matRef.current) {
        if (om.args.color !== undefined) {
          matRef.current.color.set(om.args.color);
        }
      }
    };
    init();
    onOMIdChanged(id, init);
    return () => {
      offOMIdChanged(id, init);
    };
  });

  useHelper(state.currentId == id && helper && ref, BoxHelper);

  return (
    <>
      <Text
        ref={ref}
        font={font}
        onClick={(e) => {
          if (!state.currentId) e.stopPropagation();
          if (EnableClickTrigger(camera.position.clone(), ref.current!) && state.currentId !== id) {
            pivotRef.current = ref.current;
            editorStore.currentId = id;
          }
        }}
        onPointerMissed={(e) => {
          if (e.type === "click" && state.currentId == id) {
            editorStore.init(e)
            e.preventDefault();
          }
        }}
      >
        {om.args.content}
        <meshStandardMaterial ref={matRef} color={om.args.color || "#43D9D9"} />
      </Text>
    </>
  );
};
const MyText = memo(_Text);

export const MyTexts = memo(_MyTexts);
