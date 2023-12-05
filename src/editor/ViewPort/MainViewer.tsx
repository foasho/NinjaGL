import { useState, useEffect, useRef, useLayoutEffect, Suspense } from 'react';

import { gltfLoader } from '@ninjagl/core';
import {
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  PerspectiveCamera as DPerspectiveCamera,
  Preload,
  Text,
} from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import clsx from 'clsx';
import { useSession } from 'next-auth/react';
import { Perf } from 'r3f-perf';
import { useTranslation } from 'react-i18next';
import { AiFillCamera, AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { ImEarth } from 'react-icons/im';
import { MdVideogameAsset, MdVideogameAssetOff } from 'react-icons/md';
import { TiSpanner } from 'react-icons/ti';
import Swal from 'sweetalert2';
import { AnimationMixer, Euler, Mesh, Object3D, Vector3, MathUtils, PerspectiveCamera, Color } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useSnapshot } from 'valtio';

import { isNumber } from '@/commons/functional';
import { Loading2D } from '@/commons/Loading2D';
import { EDeviceType, useInputControl } from '@/hooks/useInputControl';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

import { globalConfigStore, globalContentStore, globalStore } from '../Store/Store';

import { Cameras } from './MainViewItems/Cameras';
import { FogComponent } from './MainViewItems/Fog';
import { MyLights } from './MainViewItems/Lights';
import { MyEffects } from './MainViewItems/MyEffects';
import { MyEnviroment } from './MainViewItems/MyEnvironment';
import { MyText3Ds } from './MainViewItems/MyText3Ds';
import { StaticObjects } from './MainViewItems/Objects';
import { Avatar } from './MainViewItems/Player';
import { MySky } from './MainViewItems/Sky';
import { Terrain } from './MainViewItems/Terrain';
import { ThreeObjects } from './MainViewItems/Three';
import { UICanvas } from './MainViewUIs/UICanvas';

export const MainViewer = () => {
  const configState = useSnapshot(globalConfigStore);
  const [renderCount, setRenderCount] = useState(0);
  const contentsState = useSnapshot(globalContentStore);
  const [isHovered, setIsHovered] = useState(false);
  const [isConfHovered, setIsConfHovered] = useState(false);
  // const cameraSpeedRef = useRef<HTMLInputElement>();
  const [cameraSpeed, setCameraSpeed] = useState<number>(1);
  const cameraFarRef = useRef<HTMLInputElement>(null);
  const [cameraFar, setCameraFar] = useState<number>(1000);
  // const worldSizeRef = useRef<HTMLInputElement>(null);
  const worldSize = 64;
  // const worldGridSizeRef = useRef<HTMLInputElement>(null);
  const worldGridSize = 8;
  const [uiGridNum, setUIGridNum] = useState<8 | 16 | 24 | 32>(8);
  const { getAvatarOM, removeOM, addOM, onNJCChanged, offNJCChanged } = useNinjaEditor();
  // 水平グリッド
  const [isGrid, setIsGrid] = useState<boolean>(false);
  const [isWorldHelper, setIsWorldHelper] = useState<boolean>(true);
  const [isGizmo, setIsGizmo] = useState<boolean>(true);
  const [showCanvas, setShowCanvas] = useState<boolean>(true);
  const [showUI, setShowUI] = useState<boolean>(false);
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Editorの設定に同期
   */

  /**
   * NJCの変更を検知して、再レンダリングする
   */
  useEffect(() => {
    const init = () => {
      setRenderCount(renderCount + 1);
    };
    onNJCChanged(init);
    return () => {
      offNJCChanged(init);
    };
  }, []);

  const { t } = useTranslation();

  return (
    <div className='relative h-full bg-[#e2e2e2]'>
      <Suspense fallback={<Loading2D />}>
        <Canvas
          key={renderCount}
          style={{ display: showCanvas ? 'block' : 'none' }}
          id='mainviewcanvas'
          shadows
        >
          <Suspense fallback={null}>
            <MyLights />
            <StaticObjects />
            <Terrain />
            <Avatar />
            <MySky />
            <ThreeObjects />
            <Cameras />
            <FogComponent />
            <MyEnviroment />
            <MyText3Ds />
            <MyEffects />
            <SystemHelper
              isGizmo={isGizmo}
              cameraFar={cameraFar}
              cameraSpeed={cameraSpeed}
              worldSize={worldSize}
              isGrid={isGrid}
              isWorldHelper={isWorldHelper}
              worldGridSize={worldGridSize}
            />
            <Preload all />
          </Suspense>
        </Canvas>
      </Suspense>
      <div className='absolute top-0 z-50 h-full w-full bg-white/50' style={{ display: showUI ? 'block' : 'none' }}>
        <UICanvas gridNum={uiGridNum} />
      </div>
      {/** コントロール層 */}
      <div className={clsx('absolute left-1/2 top-10 z-50 -translate-x-1/2')}>
        <a
          className='relative mr-1 cursor-pointer rounded-md bg-[#222] px-1.5 py-1 text-white'
          onMouseLeave={() => setIsHovered(false)}
          onMouseOver={() => setIsHovered(true)}
        >
          <ImEarth className='inline' />
          {isHovered && (
            <div className='absolute left-0 top-full z-10 block w-48 rounded-md bg-primary p-3 shadow-md'>
              <div className='mb-3'>
                <label className='block'>
                  <input type='checkbox' checked={isGrid} onChange={() => setIsGrid(!isGrid)} />
                  水平グリッド線
                </label>
                <label className='block'>
                  <input type='checkbox' checked={isWorldHelper} onChange={() => setIsWorldHelper(!isWorldHelper)} />
                  ワールド補助線
                </label>
                <label className='block'>
                  <input type='checkbox' checked={isGizmo} onChange={() => setIsGizmo(!isGizmo)} />
                  Gizmo
                </label>
              </div>
              <div className='mb-3 grid grid-cols-2 gap-1'>
                <label>
                  視野(far)
                  <input
                    type='text'
                    ref={cameraFarRef}
                    placeholder={cameraFar.toString()}
                    onKeyDown={(e: any) => {
                      if (e.key == 'Enter' && cameraFarRef.current) {
                        if (isNumber(cameraFarRef.current.value)) {
                          const val = Number(cameraFarRef.current.value);
                          if (val <= 4096) {
                            setCameraFar(val);
                          } else {
                            Swal.fire({
                              title: 'エラー',
                              text: '4096以下の値を入力してください',
                              icon: 'error',
                            });
                          }
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </a>
        <a
          className='relative mr-1 cursor-pointer rounded-md bg-[#222] px-1.5 py-1 text-white'
          onMouseLeave={() => setIsConfHovered(false)}
          onMouseOver={() => setIsConfHovered(true)}
        >
          <TiSpanner className='inline' />
          {isConfHovered && (
            <div className='absolute left-0 top-full z-10 block min-w-[200px] rounded-md bg-primary p-3 shadow-md'>
              <div>
                <span className='mb-2 mr-3'>{t('physics')}</span>
                <input
                  type='checkbox'
                  className='inline'
                  checked={configState.physics}
                  onChange={(e) => {
                    globalConfigStore.physics = e.target.checked;
                  }}
                />
              </div>
            </div>
          )}
        </a>
        <a
          onClick={() => {
            if (cameraSpeed > 7) {
              setCameraSpeed(1);
            } else {
              setCameraSpeed(cameraSpeed + 1);
            }
          }}
          className='relative mr-1 cursor-pointer select-none rounded-md bg-[#222] px-1.5 py-1 text-white'
        >
          <AiFillCamera className='inline' />
          <span className='align-top text-sm'>{cameraSpeed}</span>
        </a>
        <a
          className='mr-1 cursor-pointer rounded-md bg-[#222] px-1.5 py-1 text-white'
          onClick={() => setShowCanvas(!showCanvas)}
        >
          {showCanvas ? <AiFillEye className='inline' /> : <AiFillEyeInvisible className='inline' />}
        </a>
        <a
          className='mr-1 cursor-pointer rounded-md bg-[#222] px-1.5 py-1 text-white'
          onClick={() => setShowUI(!showUI)}
        >
          {showUI ? <MdVideogameAsset className='inline' /> : <MdVideogameAssetOff className='inline' />}
        </a>
        {showUI && (
          <>
            <a
              onClick={() => {
                if (uiGridNum == 8) {
                  setUIGridNum(16);
                } else if (uiGridNum == 16) {
                  setUIGridNum(24);
                } else if (uiGridNum == 24) {
                  setUIGridNum(32);
                } else if (uiGridNum == 32) {
                  setUIGridNum(8);
                }
              }}
              className='mr-1.25 ml-0.5 cursor-pointer rounded-md bg-[#222] px-2.5 py-1 text-lg text-white'
            >
              {uiGridNum}
            </a>
          </>
        )}
      </div>
      {isLoading && (
        <div
          style={{
            display: 'none',
            background: '#12121266',
            height: '100%',
            width: '100%',
            top: 0,
            left: 0,
            position: 'absolute',
            zIndex: 1000000,
          }}
        >
          <div
            style={{
              color: '#fff',
              fontWeight: 'bold',
              position: 'absolute',
              width: '100%',
              textAlign: 'center',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            Loading...
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 補助機能
 */
interface ISysytemHelper {
  worldGridSize: number;
  cameraFar: number;
  cameraSpeed: number;
  isGrid: boolean;
  isWorldHelper: boolean;
  worldSize: number;
  isGizmo: boolean;
}
const SystemHelper = (props: ISysytemHelper) => {
  const [minimal, setMinimal] = useState(true);
  const gridHelperSize = 4096;
  const divisions = props.worldGridSize;
  const cellSize = props.worldSize / divisions;
  const numberElements: any[] = [];
  const numberPlanes: any[] = [];

  const getCenterPosFromLayer = (layer: number, yPos: number, worldSize: number, layerGrid: number): Vector3 => {
    const layerXLen = worldSize / layerGrid;
    const layerZLen = worldSize / layerGrid;
    const cx = worldSize / 2;
    const cz = worldSize / 2;
    const c = Math.ceil(layer / layerGrid);
    let r = layer % layerGrid;
    if (r === 0) r = layerGrid;
    const absPosX = (layerGrid - r) * layerXLen;
    const absPosZ = (c - 1) * layerZLen;
    const worldXZ = [absPosX - cx + layerXLen / 2, -absPosZ + cz - layerZLen / 2];
    return new Vector3(worldXZ[0], yPos, worldXZ[1]);
  };

  if (props.isWorldHelper) {
    for (let i = 0; i < divisions; i++) {
      for (let j = 0; j < divisions; j++) {
        const number = i * divisions + j + 1;
        const textPosition = getCenterPosFromLayer(number, -0.01, props.worldSize, divisions);
        const planePosition = new Vector3().addVectors(textPosition, new Vector3(0, -0.01, 0));
        const isEven = (i + j) % 2 === 0;
        const color1 = isEven ? new Color(0x808080) : new Color(0xd3d3d3);
        const color2 = isEven ? new Color(0xd3d3d3) : new Color(0x808080);
        numberElements.push(
          <Text
            key={number}
            fontSize={cellSize * 0.25}
            position={textPosition}
            rotation={[Math.PI / 2, Math.PI, 0]}
            color={color1}
          >
            {number}
          </Text>,
        );
        numberPlanes.push(
          <mesh key={number} position={planePosition} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[cellSize, cellSize]} />
            <meshBasicMaterial color={color2} transparent={true} opacity={0.3} />
          </mesh>,
        );
      }
    }
  }

  return (
    <>
      <CameraControl cameraSpeed={props.cameraSpeed} cameraFar={props.cameraFar} />
      {props.isGrid && <gridHelper args={[gridHelperSize, gridHelperSize]} />}
      {props.isGizmo && (
        <GizmoHelper alignment='top-right' margin={[75, 75]}>
          <group scale={0.75}>
            <GizmoViewport labelColor='white' axisHeadScale={1} />
          </group>
        </GizmoHelper>
      )}
      <Perf
        position={'bottom-right'}
        style={{ position: 'absolute' }}
        minimal={minimal}
        onClick={() => setMinimal(!minimal)}
      />
      <>
        {numberElements}
        {numberPlanes}
      </>
    </>
  );
};

/**
 * WASDカメラ視点移動
 * ※Fキーで任意のオブジェクトにフォーカスする
 * 補助操作
 */
interface ICameraControl {
  cameraFar: number;
  cameraSpeed: number;
  enable?: boolean;
}
export const CameraControl = (props: ICameraControl) => {
  const state = useSnapshot(globalStore);
  const contentState = useSnapshot(globalContentStore);
  const editor = useNinjaEditor();
  const ref = useRef<OrbitControlsImpl>(null);
  const cameraRef = useRef<PerspectiveCamera>(null);
  const { gl, camera } = useThree();
  const { input } = useInputControl({ device: EDeviceType.Desktop });
  // Fキーが押された瞬間にカメラをフォーカスするためのフラグ
  const [focusOnObject, setFocusOnObject] = useState(false);

  useLayoutEffect(() => {
    if (cameraRef && cameraRef.current) {
      const initCameraPosition = new Vector3().copy(contentState.cameraPosition);
      cameraRef.current.position.copy(initCameraPosition.clone());
      cameraRef.current.lookAt(0, 0, 0);
      camera.position.copy(initCameraPosition.clone());
      camera.lookAt(0, 0, 0);
      // targetFocusCamera('', initCameraPosition);
    }
  }, []);

  useEffect(() => {
    if (cameraRef && cameraRef.current) {
      camera.far = props.cameraFar;
      cameraRef.current.far = camera.far;
    }
  }, [props.cameraFar]);

  /**
   * 選択中のオブジェクトにカメラをフォーカスする
   * @param id
   */
  const targetFocusCamera = (id: string, p: Vector3 | null = null) => {
    const position = p ? p : editor.getPosition(id);
    if (position) {
      const target = new Vector3().copy(position.clone());

      // ターゲットからカメラまでの距離を設定
      const distance = 5;

      // ターゲットの前方向ベクトルをカメラの現在の位置から計算
      const forwardDirection = new Vector3().subVectors(target, cameraRef.current!.position).normalize();
      forwardDirection.negate(); // ターゲットの背後方向を取得

      // ターゲットの上方向ベクトルを取得
      const upDirection = new Vector3(0, 1, 0);

      // ターゲットの右方向ベクトルを取得
      const rightDirection = new Vector3();
      rightDirection.crossVectors(upDirection, forwardDirection).normalize();

      // カメラの上方向ベクトル、右方向ベクトル、背後方向ベクトルに距離をかける
      upDirection.multiplyScalar(distance);
      rightDirection.multiplyScalar(distance);
      forwardDirection.multiplyScalar(distance);

      // ターゲットに上方向ベクトル、右方向ベクトル、背後方向ベクトルを加算して、フォーカス位置を計算
      const focusPosition = new Vector3().addVectors(target, upDirection).add(rightDirection).add(forwardDirection);

      cameraRef.current!.position.copy(focusPosition);
      cameraRef.current!.lookAt(target);
      if (ref && ref.current) {
        ref.current.target.copy(target);
      }
    }
  };

  const calculateNewTarget = (camera: PerspectiveCamera, distance: number) => {
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    const newPosition = new Vector3().addVectors(camera.position, direction.multiplyScalar(distance));
    return newPosition;
  };

  useFrame((_, delta) => {
    // Fキーが押された瞬間の検出
    if (input.pressedKeys.includes('KeyF') && !focusOnObject) {
      setFocusOnObject(true);
    } else if (!input.pressedKeys.includes('KeyF') && focusOnObject) {
      setFocusOnObject(false);
    }

    // Fキーが押された瞬間にstate.currentIdにフォーカスする
    if (focusOnObject && state.currentId) {
      targetFocusCamera(state.currentId);
    }
    if (input.dash && (input.forward || input.backward || input.right || input.left)) {
      const st = props.cameraSpeed * delta * 10;
      const cameraDirection = new Vector3();
      cameraRef.current!.getWorldDirection(cameraDirection);
      const cameraPosition = cameraRef.current!.position.clone();

      if (input.forward) {
        cameraPosition.add(cameraDirection.clone().multiplyScalar(st));
      }
      if (input.backward) {
        cameraPosition.sub(cameraDirection.clone().multiplyScalar(st));
      }
      if (input.right) {
        const cameraRight = new Vector3();
        cameraRight.crossVectors(cameraDirection, cameraRef.current!.up).normalize();
        cameraPosition.add(cameraRight.multiplyScalar(st));
      }
      if (input.left) {
        const cameraLeft = new Vector3();
        cameraLeft.crossVectors(cameraDirection, cameraRef.current!.up).normalize();
        cameraPosition.sub(cameraLeft.multiplyScalar(st));
      }
      globalContentStore.cameraPosition.copy(cameraPosition.clone());
      cameraRef.current!.position.copy(cameraPosition);
      ref.current!.target.copy(cameraPosition.add(cameraDirection));
    } else if (ref.current && cameraRef.current) {
      cameraRef.current.position.copy(ref.current.object.position);
      cameraRef.current.rotation.copy(ref.current.object.rotation);
      cameraRef.current.lookAt(ref.current.target);
    }

    if (ref.current && cameraRef.current) {
      // // 新しいターゲット位置を計算して更新します
      const distance = props.cameraSpeed * 10; // カメラとターゲットの一定距離を指定
      const newTarget = calculateNewTarget(cameraRef.current, distance);
      ref.current.target.copy(newTarget);
    }
  });

  return (
    <>
      <DPerspectiveCamera makeDefault ref={cameraRef} />
      <OrbitControls
        ref={ref}
        args={[cameraRef.current!, gl.domElement]}
        camera={cameraRef.current!}
        makeDefault={true}
      />
    </>
  );
};
