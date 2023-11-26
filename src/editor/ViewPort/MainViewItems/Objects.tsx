import { useEffect, useMemo, useRef, MutableRefObject } from 'react';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Euler, Group, Matrix4, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three';
import { GLTF } from 'three-stdlib';
import { useSnapshot } from 'valtio';

import { globalStore } from '@/editor/Store/Store';
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
  const { scene } = useGLTF(om.args.url) as GLTF;
  const ref = useRef<Group>(null);
  const {
    setPosition,
    setRotation,
    setScale,
    getPosition,
    getRotation,
    getScale,
    getMaterialData,
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
        ref.current.position.copy(getPosition(id));
        ref.current.rotation.copy(getRotation(id));
        ref.current.scale.copy(getScale(id));
        const materialData = getMaterialData(id);
        if (materialData) {
          ref.current.traverse((node: any) => {
            if (node.isMesh && node instanceof Mesh) {
              node.material = materialData.material;
            }
          });
        }
        if (om.args.defaultAnimation) {
          const animation = om.animations.find((anim) => anim.name == om.args.defaultAnimation);
          if (animation && om.mixer) {
            om.mixer.clipAction(animation).play();
          }
        }
      }
    };
    init();
    onOMIdChanged(id, init);
    return () => {
      offOMIdChanged(id, init);
    };
  }, []);

  useFrame((_, delta) => {
    if (om.args.defaultAnimation && om.mixer) {
      if (om.args.animationLoop) {
        om.mixer.update(delta);
      }
    }
  });

  return (
    <>
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
      <group ref={ref}>
        <primitive
          visible={state.hiddenList.indexOf(id) == -1}
          onClick={(e) => (e.stopPropagation(), (globalStore.currentId = id))}
          onPointerMissed={(e) => e.type === 'click' && globalStore.init()}
          object={scene}
        />
      </group>
    </>
  );
};
