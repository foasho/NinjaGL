import React, { useRef, useEffect } from "react";
import { Mesh, Texture } from "three";
import { useNinjaEngine } from "../hooks";
import { IObjectManagement } from "../utils";
import { useTexture } from "@react-three/drei";

export const OMImages = () => {
  const { oms } = useNinjaEngine();
  const videos = oms.filter((om) => om.type === "image");

  return (
    <>
      {videos.map((om) => {
        return <OMImage key={om.id} {...om} />;
      })}
    </>
  );
};

const OMImage = ({ ...om }: IObjectManagement) => {
  const ref = useRef<Mesh>(null!);
  const { onOMIdChanged, offOMIdChanged } = useNinjaEngine();
  const texture = useTexture(om.args.src || "/videos/dummy.mp4");

  useEffect(() => {
    const update = () => {
      // transform
      if (om.args.position) {
        ref.current.position.set(
          om.args.position.x,
          om.args.position.y,
          om.args.position.z
        );
      }
      if (om.args.rotation) {
        ref.current.rotation.set(
          om.args.rotation.x,
          om.args.rotation.y,
          om.args.rotation.z
        );
      }
      if (om.args.scale) {
        ref.current.scale.set(
          om.args.scale.x,
          om.args.scale.y,
          om.args.scale.z
        );
      }
    };
    update();
    onOMIdChanged(om.id, update);
    return () => {
      offOMIdChanged(om.id, update);
    };
  }, []);

  return (
    <mesh ref={ref}>
      <planeGeometry args={[om.args.width || 1.6, om.args.height || 0.9]} />
      <meshBasicMaterial map={texture as Texture} toneMapped={false} />
    </mesh>
  );
};
