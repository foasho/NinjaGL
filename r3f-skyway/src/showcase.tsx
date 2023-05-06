import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Environment, OrbitControls, useFont, useTexture, Text3D } from "@react-three/drei";
import { VRButton, XR, startSession, stopSession, useXR } from "@react-three/xr";
import { IInputMovement, useInputControl } from "./hooks/InputControl";
import { Box3, Color, Mesh, Object3D, Vector2, Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl, SkeletonUtils } from "three-stdlib";
import { IPrivateCallProps, IPublishData, SkywayPrivateCall, useSkyway } from "./hooks/useSkyway";
import { LocalP2PRoomMember } from "@skyway-sdk/room";
import { Form, Input } from "./form";

const Showcase = () => {
  const ref = useRef<Mesh>();
  return (
    <>
      <div id="target" style={{ height: "100vh", width: "100vw" }}>
        {/* <VRButton /> */}
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
  visibleDistance?: number; // default 25,
  fontPath?: string; // ttf or woff
  supportVR?: boolean; // VRがサポートされているかどうか
}

export const R3FSkyway = ({ object, syncRotation, offset, roomName, playerName, frameRate, visibleDistance, fontPath }: IR3FSkywayProps) => {
  const refNameText = useRef<any>();
  const input = useInputControl();
  const { camera } = useThree();
  const _frameRate = frameRate || 12;
  const _visibleDistance = visibleDistance ||25;
  const [callRoom, setCallRoom] = useState<SkywayPrivateCall>();
  const _fontPath = fontPath? fontPath:'/fonts/MPLUS1.ttf';
  const [supportVR, setSupportVR] = useState<boolean>(false);

  const { publishData, membersData, me, updateCnt } = useSkyway({
    enabled: true,
    roomName: roomName,
  });

  const isVRSupported = async () => {
    // Check if WebXR API is available
    if ('xr' in navigator) {
      try {
        // Check if immersive VR session is supported
        const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
        return isSupported;
      } catch (err) {
        console.error('Error checking VR support:', err);
        return false;
      }
    } else {
      return false;
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      SkywayFrame(1000 / _frameRate);
    }, 1000 / _frameRate);
    isVRSupported().then((supported) => {
      setSupportVR(supported);
    });
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
    <SkywayContext.Provider value={{ 
      object, 
      syncRotation, 
      offset, 
      roomName, 
      playerName, 
      frameRate: _frameRate, 
      visibleDistance: _visibleDistance,
      fontPath: _fontPath,
      supportVR: supportVR,
    }}>
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
        font={_fontPath}
      >
        {playerName? playerName: "プレイヤー"}
      </Text>
      <Others 
        membersData={membersData} 
        me={me} 
        updateCnt={updateCnt}
      />
      <MessageWindow/>
      <SupportVRButton/>
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
}

const Other = ({ id }: IOtherProps) => {
  const sw = useContext(SkywayContext);
  const [select, setSelect] = useState(false);
  const ref = useRef<Mesh>();
  const refNameText = useRef<any>();
  const pData = useRef<IPublishData>();
  const [obj, setObj] = useState<Mesh|Object3D>();
  const { camera } = useThree();

  useEffect(() => {
    const loadModel = async () => {
      if (pData.current && pData.current.objectURL) {
        // 後で実装
        // const object = await loadObject(pData.current.objectURL);
        // const target = SkeletonUtils.clone(object);
        // target.animations = object.current.animations || [];
        // setObj(target);
      }
    }
    loadModel();
    const interval = setInterval(() => {
      SkywayFrame(1000 / sw.frameRate);
    }, 1000 / sw.frameRate);
    return () => clearInterval(interval);
  }, []);

  const { getPData } = useSkyway({ enabled: true, roomName: sw.roomName });

  // ランダムな色を生成
  const color = useMemo(() => {
    return new Color().setHSL(Math.random(), 1.0, 0.5);
  }, []);

  const SkywayFrame = (timeDelta: number) => {
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
      pData.current = pdata;
    }
    if (refNameText.current && ref.current){
      const aabb = new Box3().setFromObject(ref.current);
      const yOffset = aabb.max.y - aabb.min.y;
      refNameText.current.position.copy(
        ref.current.position.clone().add(new Vector3(0, yOffset, 0))
      )
      refNameText.current.lookAt(
        camera.position.clone()
      )
    }
  };

  return (
    <>
      {obj?
        <mesh 
          ref={ref}
          onClick={(e) => (e.stopPropagation(), setSelect(true))}
          onPointerMissed={(e) => e.type === 'click' && (setSelect(false))}
        >
          <primitive object={obj} />
        </mesh>
        :
        <mesh 
          ref={ref}
          onClick={(e) => (e.stopPropagation(), setSelect(true))}
          onPointerMissed={(e) => e.type === 'click' && (setSelect(false))}
        >
          <boxBufferGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color={color} />
        </mesh>
      }
      <Text
        ref={refNameText}
        color={"black"}
        fontSize={0.5}
        font={sw.fontPath}
      >
        {pData.current && pData.current.username? pData.current.username: "名前未設定"}
      </Text>
      {select && 
      <>
        <UserCard pdata={pData.current} />
      </>
      }
    </>
  )
}


interface IUserCardProps {
  pdata: IPublishData;
  stream?: MediaStream;
}
const UserCard = ({ pdata, stream }: IUserCardProps) => {
  const sw = useContext(SkywayContext);
  const baseColor = "#00B6CF";
  const ref = useRef<any>();
  const cardRef = useRef<any>();
  const { camera, size } = useThree();
  const [phoneTexture, userTexture, chatTexture, teleportTexture] = useTexture(["phone.png", "user.png", "chat.png", "teleport.png"])
  useFrame(() => {
    if (ref.current && cardRef.current) {
      // カメラの向きを取得
      const cameraDirection = new Vector3();
      camera.getWorldDirection(cameraDirection);

      // カメラの位置から少し離れた位置を計算
      const cameraPosition = camera.position.clone().add(cameraDirection);

      // カメラのクリップ空間にオブジェクトの位置を変換
      const clipPosition = cameraPosition.project(camera);

      // オフセットをクリップ空間に適用
      const ratio = size.width / size.height;
      clipPosition.x = -1 + 0.3 + (ratio<1? 0.9-ratio: 0); // 左端に移動し、さらに少し右にオフセット
      clipPosition.y = 1 - 0.7; // 上端に移動し、さらに少し下にオフセット

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
        scale={[0.5, 0.5, 0.5]}
      >
        <mesh ref={cardRef}>
          <planeBufferGeometry args={[1, 1.7]}/>
          <meshBasicMaterial 
            color="#FFF" 
            // opacity={0.5} // 透明度を設定 (0 から 1 までの値)
            // transparent={true} // 透明度を有効にする
          />
        </mesh>
        <group
          position={[0, 0, 0.001]}
        >

          <mesh
            position={[0, 0.65, 0]}
          >
            <planeBufferGeometry args={[1.0, 0.7]}/>
            <meshBasicMaterial color="#FFF" />
          </mesh>
          {stream ?
            <mesh
              position={[0, 0.6, 0.001]}
            >
              <planeBufferGeometry args={[0.6, 0.6]}/>
              <meshBasicMaterial color="#fff" />
            </mesh>
            :
            <mesh
              position={[0, 0.6, 0.001]}
            >
              <planeBufferGeometry args={[0.6, 0.6]}/>
              <meshBasicMaterial
                map={userTexture}
                transparent={true}
              />
            </mesh>
          }

          <Text
            position={[-0.15, 0.1, 0.01]}
            color={baseColor}
            fontSize={0.1}
            font={sw.fontPath}
          >
            {(pdata && pdata.username)? pdata.username: "名前未設定"}
          </Text>
          {/* 通話ボタン */}
          <group
            position={[-0.25, -0.7, 0]}
          >
            <mesh>
              <planeBufferGeometry args={[0.1, 0.1]}/>
              <meshBasicMaterial
                transparent={true}
                map={phoneTexture}
              />
            </mesh>
            <mesh>
              <circleBufferGeometry args={[0.1, 32]}/>
              <meshBasicMaterial
                color={baseColor}
              />
            </mesh>
          </group>
          {/* チャットボタン */}
          <group
            position={[0, -0.7, 0]}
          >
            <mesh>
              <planeBufferGeometry args={[0.1, 0.1]}/>
              <meshBasicMaterial
                transparent={true}
                map={chatTexture}
              />
            </mesh>
            <mesh>
              <circleBufferGeometry args={[0.1, 32]}/>
              <meshBasicMaterial
                color={baseColor}
              />
            </mesh>
          </group>
          {/* テレポート遷移 */}
          <group
            position={[0.25, -0.7, 0]}
          >
            <mesh>
              <planeBufferGeometry args={[0.1, 0.1]}/>
              <meshBasicMaterial
                transparent={true}
                map={teleportTexture}
              />
            </mesh>
            <mesh>
              <circleBufferGeometry args={[0.1, 32]}/>
              <meshBasicMaterial
                color={baseColor}
              />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}

/**
 * メッセージウィンドウ
 */
const MessageWindow = () => {
  const sw = useContext(SkywayContext);
  const ref = useRef<any>();
  const { camera, size } = useThree();
  const [sendTexture] = useTexture(["send.png"]);

  useFrame(() => {
    if (ref.current) {
      // カメラの向きを取得
      const cameraDirection = new Vector3();
      camera.getWorldDirection(cameraDirection);

      // カメラの位置から少し離れた位置を計算
      const cameraPosition = camera.position.clone().add(cameraDirection);

      // カメラのクリップ空間にオブジェクトの位置を変換
      const clipPosition = cameraPosition.project(camera);

      // オフセットをクリップ空間に適用
      const ratio = size.width / size.height;
      clipPosition.x = -1 + 0.4 + (ratio<1? 0.9-ratio: 0); // 左端に移動し、さらに少し右にオフセット
      clipPosition.y = -1 + 0.1; // 上端に移動し、さらに少し下にオフセット

      // クリップ空間からワールド空間にオブジェクトの位置を逆変換
      const worldPosition = clipPosition.unproject(camera);

      // オブジェクトの位置を更新
      ref.current.position.copy(worldPosition);

      // オブジェクトがカメラの向きに追従するようにする
      ref.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group ref={ref}>
      <Form>
        <Input 
          name="message" 
          type="text" 
          scale={[0.5, 0.5, 0.5]}
          font={sw.fontPath}
          width={1}
        />
        <mesh
          position={[0.2, 0, 0]}
        >
          <planeBufferGeometry args={[0.06, 0.06]}/>
          <meshBasicMaterial 
            color="#FFF"
            transparent={true}
            map={sendTexture}
          />
        </mesh>
      </Form>
    </group>
  )
}

/**
 * VRサポートボタン
 */
const SupportVRButton = () => {
  const sw = useContext(SkywayContext);
  const [vrTexture] = useTexture(["vr.png"]);
  const { isPresenting } = useXR();
  const trigVR = () => {
    if (!isPresenting) {
      startSession("immersive-vr", undefined);
    }
    else {
      stopSession();
    }
  }
  return (
    <>
    {sw.supportVR &&
      <mesh
        onClick={trigVR}
      >
        <circleBufferGeometry args={[0.5, 32]}/>
        <meshBasicMaterial
          transparent={true}
          map={vrTexture}
        />
      </mesh>
    }
    </>
  )
}

/**
 * ShowCaseコンポネント
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Showcase />
  </React.StrictMode>
);
