import React, { Suspense } from "react";
import { Group, MathUtils, Mesh, Object3D } from "three";
import { IObjectManagement, ColliderTunnel, NonColliderTunnel } from "../utils";
import { useNinjaEngine } from "../hooks";
import { useGLTF } from "@react-three/drei";
import { GLTF, SkeletonUtils } from "three-stdlib";
import { AnimationHelper } from "../helpers";
import { DisntanceVisible } from "../helpers";

export interface IStaticObjectsProps {}

export const StaticObjects = () => {
  const engine = useNinjaEngine();
  const staticObjects = React.useMemo(() => {
    if (!engine) return [];
    const staticObjects = engine.oms.filter(
      (o: IObjectManagement) => o.type === "object"
    );
    return staticObjects ? staticObjects : [];
  }, [engine]);

  return (
    <Suspense fallback={null}>
      {staticObjects.map((om, index) => {
        return (
          <>
            {om.physics ? (
              <ColliderTunnel.In key={om.id}>
                <StaticObject om={om} key={index} />
              </ColliderTunnel.In>
            ) : (
              <NonColliderTunnel.In key={om.id}>
                <StaticObject om={om} key={index} />
              </NonColliderTunnel.In>
            )}
          </>
        );
      })}
    </Suspense>
  );
};

const StaticObject = ({ om }: { om: IObjectManagement }) => {
  const { scene, animations } = useGLTF(om.args.url as string) as GLTF;
  const [clone, setClone] = React.useState<Object3D>();
  const ref = React.useRef<Group>(null);

  React.useEffect(() => {
    const init = () => {
      if (ref.current) {
        if (om.args.position) {
          ref.current.position.copy(om.args.position.clone());
        }
        if (om.args.rotation) {
          ref.current.rotation.copy(om.args.rotation.clone());
        }
        if (om.args.scale) {
          ref.current.scale.copy(om.args.scale.clone());
        }
      }
    };
    init();
    // onOMIdChanged(id, init);
    return () => {
      // offOMIdChanged(id, init);
    };
  }, []);

  React.useEffect(() => {
    if (scene) {
      // cloneを作成
      const clone = SkeletonUtils.clone(scene);
      // animationsもコピー
      clone.animations = animations;
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
    <DisntanceVisible distance={om.args.distance}>
      <group ref={ref} renderOrder={0}>
        {clone && <AnimationHelper id={om.id} object={clone} />}
      </group>
    </DisntanceVisible>
  );
};
