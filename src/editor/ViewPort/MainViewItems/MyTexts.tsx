import { memo, useEffect, useRef, useState } from "react";

import { IObjectManagement } from "@ninjagl/core";
import { Text, useHelper } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { BoxHelper, Euler, Matrix4, MeshStandardMaterial, Vector3 } from "three";
import { useSnapshot } from "valtio";

import { EnableClickTrigger } from "@/commons/functional";
import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { PivotControls } from "./PivoitControl";

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
  const editor = useNinjaEditor();
  const [helper, setHelper] = useState<boolean>(false);
  const id = om.id;

  // 操作系
  const onDragStart = () => {
    editorStore.pivotControl = true;
  };

  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    editor.setPosition(id, position);
    editor.setScale(id, scale);
    editor.setRotation(id, rotation);
    editorStore.pivotControl = true;
  };

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
    editor.onOMIdChanged(id, init);
    return () => {
      editor.offOMIdChanged(id, init);
    };
  });

  useHelper(state.currentId == id && helper && ref, BoxHelper);

  return (
    <>
      {!state.editorFocus && (
        <PivotControls
          // @ts-ignore
          object={state.currentId == id ? ref : null}
          visible={state.currentId == id}
          depthTest={false}
          lineWidth={2}
          anchor={[0, 0, 0]}
          onDrag={(e) => onDrag(e)}
          onDragStart={() => onDragStart()}
        />
      )}
      <Text
        ref={ref}
        font={font}
        onClick={(e) => {
          e.stopPropagation();
          if (EnableClickTrigger(camera.position.clone(), ref.current!)) {
            editorStore.currentId = id;
          }
        }}
        onPointerMissed={(e) => e.type === "click" && editorStore.init()}
      >
        {om.args.content}
        <meshStandardMaterial ref={matRef} color={om.args.color || "#43D9D9"} />
      </Text>
    </>
  );
};
const MyText = memo(_Text);

export const MyTexts = memo(_MyTexts);
