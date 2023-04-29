import React, { useRef } from "react";
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame } from "@react-three/fiber";
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
          <SkywayComponent />
          <OrbitControls />
          <Environment preset="sunset" blur={0.7} background />
        </Canvas>
      </div>
    </>
  );
};

const SkywayComponent = () => {
  const ref = useRef<Mesh>();
  const input = useInputControl();
  const baseSpeed = 5; // 移動速度を調整できるように定数を追加
  useFrame((state, delta) => {
    if (ref.current) {
      let speed = baseSpeed * input.speed;
      
      if (input.forward) {
        ref.current.position.z += speed * delta;
      }
      if (input.backward) {
        ref.current.position.z -= speed * delta;
      }
      if (input.left) {
        ref.current.position.x += speed * delta;
      }
      if (input.right) {
        ref.current.position.x -= speed * delta;
      }
      if (input.jump) {
        ref.current.position.y += speed * delta;
      }
      if (input.dash) {
        // ダッシュ機能が必要であれば、ここで実装してください。
      }
      //positionの確認
      // console.log(ref.current.position);
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
