import { memo, useEffect, useRef, useState } from "react";

import { IObjectManagement } from "@ninjagl/core";
import { Text3D, useFont, useHelper } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { BoxHelper, Euler, Matrix4, MeshStandardMaterial, Vector3 } from "three";
import { useSnapshot } from "valtio";

import { EnableClickTrigger } from "@/commons/functional";
import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { PivotControls } from "./PivoitControl";

const _MyText3Ds = () => {
  const { oms, onOMsChanged, offOMsChanged } = useNinjaEditor();
  const [text3ds, setText3ds] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    const update = () => {
      const _text3ds = oms.current.filter((om) => om.type == "text3d");
      setText3ds(_text3ds);
      console.log("Update Text3Ds", _text3ds);
    };
    update();
    onOMsChanged(update);
    return () => {
      offOMsChanged(update);
    };
  }, []);

  console.log("text3ds", text3ds);

  return (
    <>
      {text3ds.map((om) => {
        return <Text3d om={om} key={om.id} />;
      })}
    </>
  );
};

const Text3d = ({ om }) => {
  const ref = useRef<any>();
  const { camera } = useThree();
  const font = useFont("/fonts/MPLUS.json");
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
      <Text3D
        ref={ref}
        font={font.data}
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
      </Text3D>
    </>
  );
};

export const MyText3Ds = memo(_MyText3Ds);
