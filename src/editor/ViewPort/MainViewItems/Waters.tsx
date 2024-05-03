import { memo, Suspense, useEffect, useRef, useState } from "react";
import { IObjectManagement } from "@ninjagl/core";
import { useHelper } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { BoxHelper, MeshStandardMaterial } from "three";
import { useSnapshot } from "valtio";

import { EnableClickTrigger } from "@/commons/functional";
import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

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
  const { camera } = useThree();
  const [width, setWidth] = useState<number>(5);
  const [height, setHeight] = useState<number>(5);
  const [widthSegments, setWidthSegments] = useState<number>(12);
  const [heightSegments, setHeightSegments] = useState<number>(12);
  const state = useSnapshot(editorStore);
  const matRef = useRef<MeshStandardMaterial>(null);
  const { onOMIdChanged, offOMIdChanged, pivotRef } = useNinjaEditor();
  const [helper, setHelper] = useState<boolean>(false);
  const id = om.id;

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
    onOMIdChanged(id, update);
    return () => {
      offOMIdChanged(id, update);
    };
  });

  useHelper(state.currentId == id && helper && ref, BoxHelper);

  return (
    <Suspense fallback={null}>
      <Water
        grp={ref}
        width={width}
        height={height}
        widthSegments={widthSegments}
        heightSegments={heightSegments}
        onClick={(e) => {
          if (!state.currentId) e.stopPropagation();
          if (EnableClickTrigger(camera.position.clone(), ref.current!) && state.currentId !== id) {
            pivotRef.current = ref.current;
            editorStore.currentId = id;
          }
        }}
        onPointerMissed={(e) => {
          if (e.type === "click" && state.currentId == id) {
            editorStore.init(e);
            e.preventDefault();
          }
        }}
      />
    </Suspense>
  );
};
const MyWater = memo(_Water);

export const MyWaters = memo(_MyWaters);
