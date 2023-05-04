import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Environment, Html, OrbitControls, RoundedBox, useFont, Text3D, useTexture, Billboard, Detailed } from "@react-three/drei";
import { VRButton, XR } from "@react-three/xr";
import { IInputMovement, useInputControl } from "./hooks/InputControl";
import { Box3, Color, Mesh, Object3D, Vector3 } from "three";
import { Font, FontLoader, OrbitControls as OrbitControlsImpl, SkeletonUtils, TextGeometry } from "three-stdlib";
import { IPublishData, useSkyway } from "./hooks/useSkyway";
import { LocalP2PRoomMember } from "@skyway-sdk/room";

const font = useFont.preload("font.json");

const Showcase = () => {
  const ref = useRef<Mesh>();
  return (
    <>
      <div id="target" style={{ height: "100vh", width: "100vw" }}>
        <VRButton />
        <Canvas shadows camera={{ position: [-3, 5, -10] }}>
          <XR>
            <pointLight position={[10, 10, 10]} castShadow />
            <R3FSkyway syncRotation object={ref} roomName="demo" />
            <mesh ref={ref} position={[0, 1, 0]} castShadow>
              <boxBufferGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color="hotpink" />
            </mesh>
            <mesh rotation={[-Math.PI/2, 0, 0]} castShadow receiveShadow>
              <planeBufferGeometry args={[100, 100]} />
              <meshStandardMaterial color="gray" />
            </mesh>
            <UserCard name="ShoOsaka" position={new Vector3(1.3123, 4.412231, 8.234235)} />
            <Environment preset="sunset" blur={0.7} background />
          </XR>
        </Canvas>
      </div>
    </>
  );
};

export const SkywayContext = createContext<IR3FSkywayProps>(null);
export interface IR3FSkywayProps {
  object: React.RefObject<Mesh|Object3D>;
  syncRotation: boolean;
  offset?: Vector3;
  roomName: string;
  playerName?: string;
  frameRate?: 12 | 24 | 30 | 60; // default 12
  visibleDistance?: number; // default 25
}

export const R3FSkyway = ({ object, syncRotation, offset, roomName, playerName, frameRate, visibleDistance }: IR3FSkywayProps) => {
  const refNameText = useRef<any>();
  const input = useInputControl();
  const { camera } = useThree();
  const _frameRate = frameRate || 12;
  const _visibleDistance = visibleDistance ||25;

  const { publishData, membersData, me, updateCnt } = useSkyway({
    enabled: true,
    roomName: roomName,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      SkywayFrame(1000 / _frameRate);
    }, 1000 / _frameRate);
    return () => clearInterval(interval);
  }, [roomName]);

  const SkywayFrame = (timeDelta: number) => {
    if (object.current) {
      // データを送信する
      publishData({
        position: object.current.position,
        rotation: object.current.rotation,
        input: input,
      });

      if (refNameText.current){
        const aabb = new Box3().setFromObject(object.current);
        const yOffset = aabb.max.y - aabb.min.y;
        refNameText.current.position.copy(
          object.current.position.clone().add(new Vector3(0, yOffset, 0))
        )
        refNameText.current.lookAt(
          camera.position.clone()
        )
      }
    }
  }

  return (
    <SkywayContext.Provider value={{ object, syncRotation, offset, roomName, playerName, frameRate: _frameRate, visibleDistance: _visibleDistance }}>
      <SkywayInput 
        input={input}
        object={object}
        syncRotation={syncRotation}
        offset={offset}
      />
      <Text
        ref={refNameText}
        color={"black"}
        fontSize={0.5}
      >
        {playerName? playerName: "Player"}
      </Text>
      <Others 
        membersData={membersData} 
        me={me} 
        updateCnt={updateCnt}
      />
    </SkywayContext.Provider>
  )
}

interface ISkywayInputControlProps {
  input: IInputMovement;
  object: React.RefObject<Mesh|Object3D>;
  syncRotation: boolean;
  offset?: Vector3;
}
const SkywayInput = ({ object, syncRotation, offset, input }: ISkywayInputControlProps) => {
  const refOrbits = useRef<OrbitControlsImpl>(null);
  const { camera, gl } = useThree();
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
      <OrbitControls
        ref={refOrbits}
        args={[camera, gl.domElement]}
        camera={camera}
        makeDefault={true}
      />
    </>
  )
};

interface IOthersProps {
  me: LocalP2PRoomMember;
  updateCnt: number;
  membersData: IPublishData[];
}
const Others = ({ membersData, me, updateCnt }: IOthersProps) => {
  const othersData = useMemo(() => {
    if (me) {
      return membersData.filter((data) => data.id !== me.id);
    }
    return [];
  }, [updateCnt]);

  return(
    <>
    {othersData.map((pdata) => (
      <Other key={pdata.id} id={pdata.id} />
    ))}
    </>
  )
}

interface IOtherProps {
  id: string;
  object?: React.RefObject<Mesh|Object3D>;
}

const Other = ({ id, object }: IOtherProps) => {
  const sw = useContext(SkywayContext);
  const [select, setSelect] = useState(false);
  const ref = useRef<Mesh>();
  const [obj, setObj] = useState<Mesh|Object3D>();
  useEffect(() => {
    if (object && object.current) {
      const target = SkeletonUtils.clone(object.current);
      target.animations = object.current.animations || [];
      setObj(target);
    }
  }, []);

  const { getPData } = useSkyway({ enabled: true, roomName: sw.roomName });

  // ランダムな色を生成
  const color = useMemo(() => {
    return new Color().setHSL(Math.random(), 1.0, 0.5);
  }, []);

  // 経過時間と前回のアップデート時間を追跡
  const elapsedTimeRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);

  useFrame((state, delta) => {
    elapsedTimeRef.current += delta;
    const updateInterval = 1 / sw.frameRate;
    if (elapsedTimeRef.current - lastUpdateTimeRef.current >= updateInterval) {
      const pdata = getPData(id);
      if (ref.current && pdata) {
        if (sw.object && sw.object.current){
          const distance = sw.object.current.position.distanceTo(pdata.position);
          if (distance > sw.visibleDistance) {
            ref.current.visible = false;
            return;
          }
          else if (ref.current.visible === false) {
            ref.current.visible = true;
          }
        }
        ref.current.position.copy(pdata.position);
        ref.current.rotation.copy(pdata.rotation);
      }
      lastUpdateTimeRef.current = elapsedTimeRef.current;
    }
  });

  return (
    <>
      {obj?
      <mesh 
        ref={ref}
      >
        <primitive object={obj} />
      </mesh>
      :
      <mesh 
        ref={ref}
      >
        <boxBufferGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    }
    </>
  )
}


interface IUserCardProps {
  name: string;
  position: Vector3;
}
const UserCard = ({ name, position }: IUserCardProps) => {
  const ref = useRef<any>();
  const cardRef = useRef<any>();
  const { camera, size } = useThree();
  const [texture1] = useTexture(["phone.png"])
  useFrame(() => {
    if (ref.current && cardRef.current) {
      // カメラの向きを取得
      const cameraDirection = new Vector3();
      camera.getWorldDirection(cameraDirection);

      // カメラの位置から少し離れた位置を計算
      const cameraPosition = camera.position
        .clone()
        .add(cameraDirection.multiplyScalar(3));

      // カメラのクリップ空間にオブジェクトの位置を変換
      const clipPosition = cameraPosition.project(camera);

      // オフセットをクリップ空間に適用
      const ratio = size.width / size.height;
      clipPosition.x = -1 + 0.3 + (ratio<1? 0.9-ratio: 0); // 左端に移動し、さらに少し右にオフセット
      clipPosition.y = 1 - 0.6; // 上端に移動し、さらに少し下にオフセット

      // クリップ空間からワールド空間にオブジェクトの位置を逆変換
      const worldPosition = clipPosition.unproject(camera);

      // オブジェクトの位置を更新
      ref.current.position.copy(worldPosition);

      // オブジェクトがカメラの向きに追従するようにする
      ref.current.quaternion.copy(camera.quaternion);
    }
  });
  return (
    <>
      <group
        ref={ref}
      >
        <mesh ref={cardRef}>
          <planeBufferGeometry args={[1, 2]}/>
          <meshBasicMaterial 
            color="#e2e2e2" 
            opacity={0.5} // 透明度を設定 (0 から 1 までの値)
            transparent={true} // 透明度を有効にする
          />
        </mesh>
        <group
          position={[0, 0, 0.001]}
        >
          <Text
            position={[0, 0.8, 0]}
            color={'#000'}
            fontSize={0.1}
            font={font}
          >
            {name}
          </Text>
          <group
            position={[0, -0.8, 0]}
          >
            <mesh>
              <planeBufferGeometry args={[0.8, 0.2]}/>
              <meshBasicMaterial color="#113649" />
            </mesh>
            <mesh position={[0.35, 0, 0]}>
              <planeBufferGeometry args={[0.2, 0.2]}/>
              <meshBasicMaterial 
                color="#ffffff" 
                map={texture1}
              />
            </mesh>
            <Text
              position={[-0.1, -0.01, 0]}
              color={'#fff'}
              fontSize={0.1}
              font={font}
            >
              Call
            </Text>
          </group>
        </group>
      </group>
    </>
  );
}


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Showcase />
  </React.StrictMode>
);
