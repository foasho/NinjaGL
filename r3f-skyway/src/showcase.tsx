import React, { useRef } from "react";
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, OrbitControls } from "@react-three/drei";
import { useInputControl } from "./hooks/InputControl";
import { Euler, Mesh, Object3D, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
// import { useSkyway } from "./hooks/useSkyway";

const Showcase = () => {
  return (
    <>
      <div id="target" style={{ height: "100vh" }}>
        <Canvas shadows camera={{ position: [-3, 5, -10] }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} castShadow />
          <TestSkyway />
          <Environment preset="sunset" blur={0.7} background />
        </Canvas>
      </div>
    </>
  );
};


const TestSkyway = () => {
  const ref = useRef<Mesh>();

  const calculatePosition = (el, camera, size) => {
    if (!ref.current) return [0, 0];
    // オブジェクトの上部に配置するためのオフセットを計算
    const yOffset = 1; // 適切なオフセット値に変更してください

    // オブジェクトの 3D 座標をカメラに変換
    const projectedPosition = ref.current.position.clone().add(new Vector3(0, yOffset+1, 0));
    const screenPosition = projectedPosition.project(camera);

    // スクリーン座標を CSS 座標に変換
    const x = (screenPosition.x + 1) / 2 * size.width;
    const y = -(screenPosition.y - 1) / 2 * size.height;

    return [x, y];
  };

  return (
    <>
      <SkywayInput 
        object={ref}
        syncRotation
        offset={new Vector3(0, 3, -8)}
      />
      <mesh ref={ref} position={[0, 1, 0]} castShadow receiveShadow>
        <boxBufferGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="hotpink" />
        <Html
          calculatePosition={calculatePosition}
          center
          distanceFactor={20}
        >
          <p style={{ 
            userSelect: "none", 
            padding: "5px 10px", 
            backgroundColor: "#e2e2e2", 
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            fontWeight: "bold",
            color: "#333",
          }}>Player</p>
        </Html>
      </mesh>
    </>
  )
}

interface ISkywayInputControlProps {
  object: React.RefObject<Mesh|Object3D>;
  syncRotation: boolean;
  offset?: Vector3;
}
const SkywayInput = ({ object, syncRotation, offset }: ISkywayInputControlProps) => {
  const refOrbits = useRef<OrbitControlsImpl>(null);
  const { camera, gl } = useThree();
  const input = useInputControl();
  const baseSpeed = 5; // 移動速度を調整できるように定数を追加
  useFrame((state, delta) => {
    if (object.current) {
      let speed = baseSpeed * input.speed;
  
      const cameraDirection = camera.getWorldDirection(new Vector3()).normalize();
      const cameraDirectionFlat = new Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
  
      const rightDirection = new Vector3().crossVectors(cameraDirectionFlat, new Vector3(0, 1, 0));
  
      if (input.dash) {
        speed *= 2;
      }
  
      let moveDirection = new Vector3();
      const forwardAmount = input.forward - input.backward;
      const rightAmount = input.right - input.left;
      
      if (forwardAmount !== 0) {
        moveDirection.addScaledVector(cameraDirectionFlat, forwardAmount);
      }
  
      if (rightAmount !== 0) {
        moveDirection.addScaledVector(rightDirection, rightAmount);
      }
      if (moveDirection.length() > 0) {
        moveDirection.normalize();
        object.current.position.addScaledVector(moveDirection, speed * delta);
  
        if (syncRotation) {
          const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
          object.current.rotation.y = targetRotation;
        }

        // もし、offsetが指定されていたら、targetからoffset分だけ離れた位置にカメラを移動させる
        if (offset) {
          // ほぼOKだが、Orbitsで向きを変えた後、その向きの方向に変わらない。cameraDirectionが変わってないから？
          // const newCameraPosition = target.current.position.clone().add(offset.clone());
          // camera.position.copy(newCameraPosition);
          // camera.lookAt(target.current.position);
          // const newCameraDirection = camera.getWorldDirection(new Vector3()).normalize()
          // refOrbits.current.target.copy(newCameraPosition.add(newCameraDirection));
        }
      }
      else if (offset){
        // ほぼOKだが、Orbitsで向きを変えた後、その向きの方向に変わらない。cameraDirectionが変わってないから？
        // refOrbits.current.target.copy(target.current.position);
      }
  
      if (input.jump) {
        object.current.position.y += speed * delta;
      }
    }
  });
  return (
    <>
      <mesh rotation={[-Math.PI/2, 0, 0]} castShadow receiveShadow>
        <planeBufferGeometry args={[100, 100]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <OrbitControls
        ref={refOrbits}
        args={[camera, gl.domElement]}
        camera={camera}
        makeDefault={true}
      />
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
