import React, { useRef, useLayoutEffect, useEffect } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera as DPerspectiveCamera, OrbitControls } from "@react-three/drei";
import { useInputControl } from "../utils/InputControls";
import { PerspectiveCamera, Vector3 } from "three";

/**
 * WASDカメラ視点移動
 * 補助操作
 */
interface IMoveableCamera {
  cameraFar?: number;
  cameraSpeed?: number;
  initCameraPosition?: Vector3;
}
export const MoveableCamera = (props: IMoveableCamera) => {
  const ref = useRef<OrbitControlsImpl>(null);
  const cameraRef = useRef<PerspectiveCamera>(null);
  const { gl, camera } = useThree();
  const input = useInputControl("desktop");
  const cameraFar = props.cameraFar ? props.cameraFar : 1000;
  const cameraSpeed = props.cameraSpeed ? props.cameraSpeed : 10;
  const initCameraPosition = props.initCameraPosition ? props.initCameraPosition : new Vector3(-3, 5, -10);

  useLayoutEffect(() => {
    if (cameraRef && cameraRef.current) {
      cameraRef.current.position.copy(initCameraPosition.clone());
      cameraRef.current.lookAt(0, 0, 0);
      camera.position.copy(initCameraPosition.clone());
      camera.lookAt(0, 0, 0);
    }
  }, []);

  useEffect(() => {
    if (cameraRef && cameraRef.current) {
      camera.far = cameraFar;
      cameraRef.current.far = camera.far;
    }
  }, [props.cameraFar]);

  useFrame((_, delta) => {
    if (input.dash && (input.forward || input.backward || input.right || input.left)) {
      const st = cameraSpeed * delta;
      const cameraDirection = new Vector3();
      cameraRef.current.getWorldDirection(cameraDirection);
      const cameraPosition = cameraRef.current.position.clone();

      if (input.forward) {
        cameraPosition.add(cameraDirection.clone().multiplyScalar(st));
      }
      if (input.backward) {
        cameraPosition.sub(cameraDirection.clone().multiplyScalar(st));
      }
      if (input.right) {
        const cameraRight = new Vector3();
        cameraRight.crossVectors(cameraDirection, cameraRef.current.up).normalize();
        cameraPosition.add(cameraRight.multiplyScalar(st));
      }
      if (input.left) {
        const cameraLeft = new Vector3();
        cameraLeft.crossVectors(cameraDirection, cameraRef.current.up).normalize();
        cameraPosition.sub(cameraLeft.multiplyScalar(st));
      }

      cameraRef.current.position.copy(cameraPosition);
      ref.current.target.copy(cameraPosition.add(cameraDirection));

    } else {
      if (ref.current && cameraRef.current) {
        cameraRef.current.position.copy(ref.current.object.position);
        cameraRef.current.rotation.copy(ref.current.object.rotation);
        cameraRef.current.lookAt(ref.current.target);
      }
    }
  });

  return (
    <>
      <DPerspectiveCamera makeDefault ref={cameraRef} />
      <OrbitControls
        ref={ref}
        args={[cameraRef.current, gl.domElement]}
        camera={cameraRef.current}
        makeDefault={true}
      />
    </>
  );
};