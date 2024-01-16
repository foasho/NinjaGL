import type { IObjectManagement } from "@ninjagl/core";
import type { MutableRefObject } from "react";
import type { Group, Matrix4, Object3D } from "three";
import type { GLTF } from "three-stdlib";
import { Suspense, useEffect, useRef, useState } from "react";
import { Loading3D } from "@/commons/Loading3D";
import { editorStore } from "@/editor/Store/Store";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Euler, Mesh, Vector3 } from "three";
import { SkeletonUtils } from "three-stdlib";
import { useSnapshot } from "valtio";

import { PivotControls } from "./PivoitControl";

export const Avatar = () => {
  const { getAvatarOM } = useNinjaEditor();
  const om = getAvatarOM();

  return <>{om && <Player {...om} />}</>;
};

/**
 * アバターデータ
 */
export const Player = ({ ...om }: IObjectManagement) => {
  const state = useSnapshot(editorStore);
  const { scene, animations } = useGLTF(om.args.url!) as GLTF;
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
    editorStore.pivotControl = true;
  };
  const onDragEnd = () => {
    // TODO: Save To DB
  };
  const onDrag = (e: Matrix4) => {
    // 位置/回転率の確認
    const position = new Vector3().setFromMatrixPosition(e);
    const rotation = new Euler().setFromRotationMatrix(e);
    const scale = new Vector3().setFromMatrixScale(e);
    setPosition(id, position);
    setScale(id, scale);
    setRotation(id, rotation);
    editorStore.pivotControl = true;
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
        setArg(id, "animations", animations);
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
          object={
            state.currentId == id
              ? (ref as MutableRefObject<Object3D>)
              : undefined
          }
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
            onClick={(e: React.PointerEvent) => (
              e.stopPropagation(), (editorStore.currentId = id)
            )}
            onPointerMissed={(e: React.PointerEvent) =>
              e.type === "click" && editorStore.init()
            }
            object={clone}
          />
        </group>
      )}
    </Suspense>
  );
};

interface AnimationHelperProps {
  id: string;
  object: Object3D;
  visible?: boolean;
  onClick?: (e: any) => void;
  onPointerMissed?: (e: any) => void;
}
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
  const [defaultAnimation, setDefaultAnimation] = useState<string>("Idle");
  const [animationLoop, setAnimationLoop] = useState<boolean>(true);

  const animationStop = () => {
    if (actions?.[defaultAnimation]) {
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
          setDefaultAnimation(_om.args.defaultAnimation as string);
        }
        setAnimationLoop(_om.args.animationLoop!);
      }
    };
    init();
    onOMIdChanged(id, init);
    return () => {
      offOMIdChanged(id, init);
    };
  });

  useEffect(() => {
    if (actions?.[defaultAnimation]) {
      animationAllStop();
      actions[defaultAnimation]!.play();
    }
    if (!animationLoop) {
      animationStop();
    }
  }, [actions, defaultAnimation, animationLoop]);

  return (
    <primitive
      ref={ref}
      visible={visible}
      onClick={onClick}
      onPointerMissed={onPointerMissed}
      object={object}
    />
  );
};