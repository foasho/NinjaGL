import React, { memo, useEffect, useRef, useState } from "react";
import { IObjectManagement } from "@ninjagl/core";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Group, Mesh, Object3D } from "three";
import { GLTF, SkeletonUtils } from "three-stdlib";
import { useSnapshot } from "valtio";

import { EnableClickTrigger } from "@/commons/functional";
import { editorStore } from "@/editor/Store/Store";
import { AnimationHelper } from "@/helpers/AnimationHelper";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

const _NPCs = () => {
  const { oms, onOMsChanged, offOMsChanged } = useNinjaEditor();
  const [npcs, setNPCs] = useState<IObjectManagement[]>([]);

  useEffect(() => {
    const update = () => {
      const _npcs = oms.current.filter((om) => om.type === "ai-npc");
      setNPCs(_npcs);
    };
    update();
    onOMsChanged(update);
    return () => {
      offOMsChanged(update);
    };
  }, [npcs]);

  return (
    <>
      {npcs.map((npc) => (
        <NPC {...npc} key={npc.id} />
      ))}
    </>
  );
};

const _NPC = ({ ...om }: IObjectManagement) => {
  const ref = useRef<Group>(null);
  const { camera } = useThree();
  const state = useSnapshot(editorStore);
  const { scene, animations } = useGLTF(om.args.url || "/models/ybot.glb") as GLTF;
  const [clone, setClone] = useState<Object3D>();
  const { pivotRef, onOMIdChanged, offOMIdChanged, getOMById, setArg } = useNinjaEditor();
  const id = om.id;

  useEffect(() => {
    const update = () => {
      if (ref.current) {
        // transformsのコピー
        const _om = getOMById(om.id) as IObjectManagement;
        if (_om && _om.args.position) ref.current.position.copy(_om.args.position);
        if (_om && _om.args.rotation) ref.current.rotation.copy(_om.args.rotation);
        if (_om && _om.args.scale) ref.current.scale.copy(_om.args.scale);
      }
    };
    update();
    onOMIdChanged(om.id, update);
    return () => {
      offOMIdChanged(om.id, update);
    };
  });

  useEffect(() => {
    if (scene) {
      // cloneを作成
      const clone = SkeletonUtils.clone(scene);
      // animationsもコピー
      clone.animations = animations;
      if (om.id) {
        setArg(om.id, "animations", animations, false);
      }
      if (om.args.castShadow) {
        clone.traverse((node) => {
          if (node instanceof Mesh) {
            node.castShadow = true;
          }
        });
      }
      setClone(clone);
    }
  }, [scene]);

  return (
    <>
      {clone && (
        <group ref={ref}>
          <AnimationHelper
            id={om.id}
            visible={state.hiddenList.indexOf(om.id) == -1}
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
            object={clone}
          />
        </group>
      )}
    </>
  );
};

// idが変わったら再描画
const NPC = React.memo(_NPC, (prev, next) => {
  return prev.id === next.id;
});

export const NPCs = memo(_NPCs);
