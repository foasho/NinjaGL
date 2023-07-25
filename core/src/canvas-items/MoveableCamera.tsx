import * as React from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useThree } from "@react-three/fiber";
import { PerspectiveCamera as DPerspectiveCamera, OrbitControls } from "@react-three/drei";
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
  const ref = React.useRef<OrbitControlsImpl>(null);
  const cameraRef = React.useRef<PerspectiveCamera>(null);
  const { gl, camera } = useThree();
  const [isMounted, setIsMounted] = React.useState(false);
  const cameraFar = props.cameraFar ? props.cameraFar : 1000;
  const cameraSpeed = props.cameraSpeed ? props.cameraSpeed : 10;
  const initCameraPosition = props.initCameraPosition ? props.initCameraPosition : new Vector3(-3, 5, -10);

  React.useLayoutEffect(() => {
    if (cameraRef && cameraRef.current) {
      cameraRef.current.position.copy(initCameraPosition.clone());
      cameraRef.current.lookAt(0, 0, 0);
      camera.position.copy(initCameraPosition.clone());
      camera.lookAt(0, 0, 0);
    }
  }, []);

  React.useEffect(() => {
    if (cameraRef && cameraRef.current) {
      camera.far = cameraFar;
      cameraRef.current.far = camera.far;
      setIsMounted(true);
    }
  }, [props.cameraFar]);

  return (
    <>
      {/** @ts-ignore */}
      <DPerspectiveCamera makeDefault ref={cameraRef} />
      {isMounted &&
        <OrbitControls
          ref={ref}
          args={[cameraRef.current!, gl.domElement]}
          camera={cameraRef.current!}
          makeDefault={true}
        />
      }
    </>
  );
};