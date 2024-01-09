import React, { useEffect, useRef, useState, memo } from "react";

import { IObjectManagement } from "@ninjagl/core";
import { useGLTF } from "@react-three/drei";
import { Euler, Group, Matrix4, Mesh, Object3D, Vector3 } from "three";
import { GLTF, SkeletonUtils } from "three-stdlib";
import { useSnapshot } from "valtio";

import { editorStore } from "@/editor/Store/Store";
import { AnimationHelper } from "@/helpers/AnimationHelper";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { PivotControls } from "./PivoitControl";

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
  const state = useSnapshot(editorStore);
  const { scene, animations } = useGLTF(om.args.url || "/models/ybot.glb") as GLTF;
  const [clone, setClone] = useState<Object3D>();
  const editor = useNinjaEditor();

  // 操作系
  const onDragStart = () => {
    editorStore.pivotControl = true;
  };

  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    editor.setPosition(om.id, position);
    editor.setScale(om.id, scale);
    editor.setRotation(om.id, rotation);
    editorStore.pivotControl = true;
  };

  useEffect(() => {
    const update = () => {
      if (ref.current) {
        // transformsのコピー
        const _om = editor.getOMById(om.id) as IObjectManagement;
        if (_om && _om.args.position) ref.current.position.copy(_om.args.position);
        if (_om && _om.args.rotation) ref.current.rotation.copy(_om.args.rotation);
        if (_om && _om.args.scale) ref.current.scale.copy(_om.args.scale);
      }
    };
    update();
    editor.onOMIdChanged(om.id, update);
    return () => {
      editor.offOMIdChanged(om.id, update);
    };
  });

  useEffect(() => {
    if (scene) {
      // cloneを作成
      const clone = SkeletonUtils.clone(scene);
      // animationsもコピー
      clone.animations = animations;
      if (om.id) {
        editor.setArg(om.id, "animations", animations);
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
      {!state.editorFocus && (
        <PivotControls
          // @ts-ignore
          object={state.currentId == om.id ? ref : null}
          visible={state.currentId == om.id}
          depthTest={false}
          lineWidth={2}
          anchor={[0, 0, 0]}
          onDrag={(e) => onDrag(e)}
          onDragStart={() => onDragStart()}
        />
      )}
      {clone && (
        <group ref={ref}>
          <AnimationHelper
            id={om.id}
            visible={state.hiddenList.indexOf(om.id) == -1}
            onClick={(e) => (e.stopPropagation(), (editorStore.currentId = om.id))}
            onPointerMissed={(e) => e.type === "click" && editorStore.init()}
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
