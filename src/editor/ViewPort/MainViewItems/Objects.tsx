import { useEffect, useMemo, useRef, MutableRefObject, useState, Suspense } from 'react';

import {  } from "@ninjagl/core";
import { useGLTF } from '@react-three/drei';
import { Euler, Group, Matrix4, Mesh, Object3D, Vector3 } from 'three';
import { GLTF, SkeletonUtils } from 'three-stdlib';
import { useSnapshot } from 'valtio';

import { Loading3D } from '@/commons/Loading3D';
import { globalStore } from '@/editor/Store/Store';
import { AnimationHelper } from '@/helpers/AnimationHelper';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

import { PivotControls } from './PivoitControl';

/**
 * シーン上で構築される基本的なオブジェクト
 * @returns
 */
export const StaticObjects = () => {
  const { oms } = useNinjaEditor();
  const staticOMs = useMemo(() => {
    return oms.filter((om) => {
      return om.type == 'object';
    });
  }, [oms]);
  return (
    <>
      {staticOMs.map((om) => {
        if (om.type == 'object') {
          return <StaticObject om={om} key={om.id} />;
        }
      })}
    </>
  );
};

/**
 * 基本的なオブジェクトのみ
 * @param props
 * @returns
 */
const StaticObject = ({ om }) => {
  const state = useSnapshot(globalStore);
  const { scene, animations } = useGLTF(om.args.url) as GLTF;
  const [clone, setClone] = useState<Object3D>();
  const ref = useRef<Group>(null);
  const {
    setPosition,
    setRotation,
    setScale,
    setArg,
    onOMIdChanged,
    offOMIdChanged,
  } = useNinjaEditor();
  const id = om.id;
  const onDragStart = () => {
    globalStore.pivotControl = true;
  };
  const onDragEnd = () => {};
  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    setPosition(id, position);
    setScale(id, scale);
    setRotation(id, rotation);
    globalStore.pivotControl = true;
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
        if (om.args.castShadow !== undefined) {
          if (clone){
            clone.traverse((node) => {
              if (node instanceof Mesh) {
                node.castShadow = om.args.castShadow;
              }
            });
          }
        }
        if (om.args.receiveShadow !== undefined) {
          if (clone){
            clone.traverse((node) => {
              if (node instanceof Mesh) {
                node.receiveShadow = om.args.receiveShadow;
              }
            });
          }
        }
      }
    };
    init();
    onOMIdChanged(id, init);
    return () => {
      offOMIdChanged(id, init);
    };
  });

  useEffect(() => {
    if (scene) {
      // cloneを作成
      const clone = SkeletonUtils.clone(scene);
      // animationsもコピー
      clone.animations = animations;
      if (id) {
        setArg(id, 'animations', animations);
      }
      if (om.args.castShadow) {
        clone.traverse((node) => {
          if (node instanceof Mesh) {
            node.castShadow = true;
          }
        });
      }
      if (om.args.receiveShadow) {
        clone.traverse((node) => {
          if (node instanceof Mesh) {
            node.receiveShadow = true;
          }
        });
      }
      setClone(clone);
    }
  }, [scene]);

  return (
    <Suspense fallback={<Loading3D />}>
      {!state.editorFocus && (
        <PivotControls
          object={state.currentId == id ? (ref as MutableRefObject<Object3D>) : undefined}
          visible={state.currentId == id}
          depthTest={false}
          lineWidth={2}
          anchor={[0, 0, 0]}
          onDrag={(e) => onDrag(e)}
          onDragStart={() => onDragStart()}
          onDragEnd={() => onDragEnd()}
        />
      )}
      {clone && (
        <group ref={ref}>
          <AnimationHelper
            id={id}
            visible={state.hiddenList.indexOf(id) == -1}
            onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
            onPointerMissed={(e) => e.type === 'click' && globalStore.init()}
            object={clone}
          />
        </group>
      )}
    </Suspense>
  );
};
