import { useEffect, useRef, MutableRefObject, useState, Suspense } from 'react';

import { useGLTF, useAnimations } from '@react-three/drei';
import { Euler, Group, Matrix4, Mesh, Object3D, Vector3 } from 'three';
import { GLTF, SkeletonUtils } from 'three-stdlib';
import { useSnapshot } from 'valtio';

import { Loading3D } from '@/commons/Loading3D';
import { globalStore } from '@/editor/Store/Store';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

import { PivotControls } from './PivoitControl';

export const Avatar = () => {
  const { getAvatarOM } = useNinjaEditor();
  const om = getAvatarOM();

  return <>{om && <Player om={om} />}</>;
};

/**
 * アバターデータ
 */
export const Player = ({ om }) => {
  const state = useSnapshot(globalStore);
  const { scene, animations } = useGLTF(om.args.url) as GLTF;
  const [clone, setClone] = useState<Object3D>();
  const ref = useRef<Group>(null);
  const {
    setPosition,
    setRotation,
    setScale,
    getPosition,
    getRotation,
    getScale,
    getMaterialData,
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
      }
    };
    init();
    onOMIdChanged(id, init);
    return () => {
      offOMIdChanged(id, init);
    };
  }, []);

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

type AnimationHelperProps = {
  id: string;
  object: Object3D;
  visible?: boolean;
  onClick?: (e: any) => void;
  onPointerMissed?: (e: any) => void;
};
const AnimationHelper = ({
  id,
  object,
  visible = true,
  onClick = (e: any) => {},
  onPointerMissed = (e: any) => {},
}: AnimationHelperProps) => {
  const animations = object.animations;
  const { ref, actions } = useAnimations(animations);

  const { getOMById, onOMIdChanged, offOMIdChanged } = useNinjaEditor();
  const [defaultAnimation, setDefaultAnimation] = useState<string>('Idle');
  const [animationLoop, setAnimationLoop] = useState<boolean>(true);

  const animationStop = () => {
    if (actions && actions[defaultAnimation]) {
      actions[defaultAnimation]!.stop();
    }
  };

  const animationAllStop = () => {
    if (actions) {
      Object.keys(actions).forEach((key) => {
        actions[key]!.stop();
      });
    }
  };

  useEffect(() => {
    const init = () => {
      const _om = getOMById(id);
      if (_om) {
        if (_om.args.defaultAnimation) {
          setDefaultAnimation(_om.args.defaultAnimation);
        }
        setAnimationLoop(_om.args.animationLoop);
      }
    };
    init();
    onOMIdChanged(id, init);
    return () => {
      offOMIdChanged(id, init);
    };
  });

  useEffect(() => {
    if (actions && actions[defaultAnimation]) {
      animationAllStop();
      actions[defaultAnimation]!.play();
    }
    if (!animationLoop) {
      animationStop();
    }
  }, [actions, defaultAnimation, animationLoop]);

  return <primitive ref={ref} visible={visible} onClick={onClick} onPointerMissed={onPointerMissed} object={object} />;
};
