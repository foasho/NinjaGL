import { memo, Suspense, useEffect, useRef, useState } from "react";
import { IObjectManagement } from "@ninjagl/core";
import { useHelper } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { BoxHelper, Euler, Matrix4, MeshStandardMaterial, Vector3 } from "three";
import { useSnapshot } from "valtio";

import { EnableClickTrigger } from "@/commons/functional";
import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { DragStartComponentProps, OnDragStartProps, PivotControls } from "./PivoitControl";
import { Water } from "./Water";

const _MyWaters = () => {
  const { oms, onOMsChanged, offOMsChanged } = useNinjaEditor();
  const [waters, setWaters] = useState<IObjectManagement[]>([]);
  useEffect(() => {
    const update = () => {
      const _waters = oms.current.filter((om) => om.type == "water");
      setWaters(_waters);
    };
    update();
    onOMsChanged(update);
    return () => {
      offOMsChanged(update);
    };
  }, [offOMsChanged, oms, onOMsChanged]);

  return (
    <>
      {waters.map((om) => {
        return <MyWater om={om} key={om.id} />;
      })}
    </>
  );
};

const _Water = ({ om }) => {
  const ref = useRef<any>();
  const grapComponent = useRef<DragStartComponentProps|null>(null);
  const { camera } = useThree();
  const [width, setWidth] = useState<number>(5);
  const [height, setHeight] = useState<number>(5);
  const [widthSegments, setWidthSegments] = useState<number>(12);
  const [heightSegments, setHeightSegments] = useState<number>(12);
  const state = useSnapshot(editorStore);
  const matRef = useRef<MeshStandardMaterial>(null);
  const editor = useNinjaEditor();
  const [helper, setHelper] = useState<boolean>(false);
  const id = om.id;

  const onDragStart = (props: OnDragStartProps) => {
    editorStore.pivotControl = true;
    grapComponent.current = props.component;
  };
  const onDragEnd = () => {
    grapComponent.current = null;
  };

  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    if (grapComponent.current === "Arrow" || grapComponent.current === "Slider") {
      editor.setPosition(id, position);
    } else if (grapComponent.current === "Scale") {
      editor.setScale(id, scale);
    } else if (grapComponent.current === "Rotator") {
      editor.setRotation(id, rotation);
    }
  };

  useEffect(() => {
    const update = () => {
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
      setWidth(om.args.width);
      setHeight(om.args.height);
      setWidthSegments(om.args.widthSegments);
      setHeightSegments(om.args.heightSegments);
    };
    update();
    editor.onOMIdChanged(id, update);
    return () => {
      editor.offOMIdChanged(id, update);
    };
  });

  useHelper(state.currentId == id && helper && ref, BoxHelper);

  return (
    <Suspense fallback={null}>
      {!state.editorFocus && (
        <PivotControls
          // @ts-ignore
          object={state.currentId == id ? ref : null}
          visible={state.currentId == id}
          depthTest={false}
          lineWidth={2}
          anchor={[0, 0, 0]}
          onDrag={(e) => onDrag(e)}
          onDragStart={onDragStart}
        />
      )}
      <Water
        grp={ref}
        width={width}
        height={height}
        widthSegments={widthSegments}
        heightSegments={heightSegments}
        onClick={(e) => {
          e.stopPropagation();
          if (EnableClickTrigger(camera.position.clone(), ref.current!)) {
            editorStore.currentId = id;
          }
        }}
        onPointerMissed={(e) => e.type === "click" && editorStore.init()}
      />
    </Suspense>
  );
};
const MyWater = memo(_Water);

export const MyWaters = memo(_MyWaters);
