import React, { useRef } from "react";
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { useInputControl } from "./hooks/InputControl";
import { Euler, Mesh, Vector3 } from "three";
import { useSkyway } from "./hooks/useSkyway";

const Showcase = () => {
  return (
    <>
      <div id="target" style={{ height: "100vh" }}>
        <Canvas shadows camera={{ position: [-3, 5, -10] }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} castShadow />
          <SkywayComponent syncRotation />
          <OrbitControls />
          <Environment preset="sunset" blur={0.7} background />
        </Canvas>
      </div>
    </>
  );
};

interface IS {
  syncRotation: boolean;
}
const SkywayComponent = ({ syncRotation }: IS) => {
  const ref = useRef<Mesh>();
  const { camera } = useThree();
  const input = useInputControl();
  const baseSpeed = 5; // 移動速度を調整できるように定数を追加
  useFrame((state, delta) => {
    if (ref.current) {
      let speed = baseSpeed * input.speed;
      // カメラの方向ベクトルを取得し、XY平面に投影する
      const cameraDirection = camera.getWorldDirection(new Vector3()).normalize();
      const cameraDirectionFlat = new Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
      // 左右の方向ベクトルを計算
      const rightDirection = new Vector3().crossVectors(cameraDirectionFlat, new Vector3(0, 1, 0));
      if (input.dash) {
        // ダッシュ機能が必要であれば、移動量を増やす
        speed *= 2;
      }
      let moveDirection = new Vector3();
      if (input.forward) {
        ref.current.position.addScaledVector(cameraDirectionFlat, speed * delta);
        moveDirection.add(cameraDirectionFlat);
      }
      if (input.backward) {
        ref.current.position.addScaledVector(cameraDirectionFlat.negate(), speed * delta);
        moveDirection.add(cameraDirectionFlat.negate());
      }
      if (input.left) {
        ref.current.position.addScaledVector(rightDirection.negate(), speed * delta);
        moveDirection.add(rightDirection.negate());
      }
      if (input.right) {
        ref.current.position.addScaledVector(rightDirection, speed * delta);
        moveDirection.add(rightDirection);
      }
      if (input.jump) {
        ref.current.position.y += speed * delta;
      }
      if (syncRotation && moveDirection.length() > 0) {
        moveDirection.normalize();
        const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
        ref.current.rotation.y = targetRotation;
      }
    }
  });
  return (
    <>
      <mesh name="attach" ref={ref} position={[0, 1, 0]} castShadow receiveShadow>
        <boxBufferGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <mesh rotation={[-Math.PI/2, 0, 0]} castShadow receiveShadow>
        <planeBufferGeometry args={[100, 100]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </>
  )
};


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Showcase />
  </React.StrictMode>
);
