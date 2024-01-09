import { useState, useEffect, useRef, Suspense, memo } from 'react';

import { GizmoHelper, GizmoViewport, Preload, Text } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import clsx from 'clsx';
import { Perf } from 'r3f-perf';
import { useTranslation } from 'react-i18next';
import { AiFillCamera, AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { ImEarth } from 'react-icons/im';
import { MdVideogameAsset, MdVideogameAssetOff } from 'react-icons/md';
import { TiSpanner } from 'react-icons/ti';
import { Vector3, Color, Raycaster } from 'three';
import { useSnapshot } from 'valtio';

import { isNumber } from '@/commons/functional';
import { Loading2D } from '@/commons/Loading2D';
import { MySwal } from '@/commons/Swal';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';
import { addInitOM } from '@/utils/omControls';

import { MoveableCameraControl } from '../Common/MoveableCamera';
import { showSelectNewObjectDialog } from '../Dialogs/SelectNewObjectDialog';
import { globalEditorStore } from '../Store/editor';
import { globalConfigStore } from '../Store/Store';

import { MemoLandScapeMaker } from './LandScapeMaker';
import { FogComponent } from './MainViewItems/Fog';
import { MyLights } from './MainViewItems/Lights';
import { MyEffects } from './MainViewItems/MyEffects';
import { MyEnviroment } from './MainViewItems/MyEnvironment';
import { MyText3Ds } from './MainViewItems/MyText3Ds';
import { StaticObjects } from './MainViewItems/Objects';
import { Avatar } from './MainViewItems/Player';
import { MySky } from './MainViewItems/Sky';
import { ThreeObjects } from './MainViewItems/Three';
import { UICanvas } from './MainViewUIs/UICanvas';

let renderCount = 0;
const _MainViewer = () => {
  console.log('MainViewer Render', renderCount++);

  return (
    <div className='relative h-full bg-[#e2e2e2]'>
      <Suspense fallback={<Loading2D />}>
        <Canvas id='mainviewcanvas' shadows>
          <SceneItems />
        </Canvas>
      </Suspense>
      <HelperControls />
      <UICanvas />
    </div>
  );
};

const SceneItems = () => {
  const { showCanvas } = useSnapshot(globalEditorStore);
  return (
    <group visible={showCanvas}>
      <Suspense fallback={null}>
        <MyLights />
        <StaticObjects />
        <Avatar />
        <MySky />
        <ThreeObjects />
        <FogComponent />
        <MyEnviroment />
        <MyText3Ds />
        <MyEffects />
        {/* <NPCs /> */}
        <MemoLandScapeMaker />
        <SystemHelper />
        <MemoContextHelper />
        <Preload all />
      </Suspense>
    </group>
  );
};

/**
 *
 */
const _HelperControls = () => {
  const { physics } = useSnapshot(globalConfigStore);
  const { isGrid, showCanvas, isWorldHelper, isGizmo, cameraFar, cameraSpeed, uiMode, uiGridNum } =
    useSnapshot(globalEditorStore);
  const [isHovered, setIsHovered] = useState(false);
  const [isConfHovered, setIsConfHovered] = useState(false);

  const { t } = useTranslation();

  return (
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
                <input type='checkbox' checked={isGrid} onChange={() => (globalEditorStore.isGrid = !isGrid)} />
                水平グリッド線
              </label>
              <label className='block'>
                <input
                  type='checkbox'
                  checked={isWorldHelper}
                  onChange={() => (globalEditorStore.isWorldHelper = !isWorldHelper)}
                />
                ワールド補助線
              </label>
              <label className='block'>
                <input type='checkbox' checked={isGizmo} onChange={() => (globalEditorStore.isGizmo = !isGizmo)} />
                Gizmo
              </label>
            </div>
            <div className='mb-3 grid grid-cols-2 gap-1'>
              <label>
                視野(far)
                <input
                  type='text'
                  placeholder={cameraFar.toString()}
                  onKeyDown={(e: any) => {
                    if (e.key == 'Enter') {
                      if (isNumber(e.target.value)) {
                        const val = Number(e.target.value);
                        if (val <= 4096) {
                          globalEditorStore.cameraFar = val;
                        } else {
                          MySwal.fire({
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
                checked={physics}
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
            globalEditorStore.cameraSpeed = 1;
          } else {
            globalEditorStore.cameraSpeed += 1;
          }
        }}
        className='relative mr-1 cursor-pointer select-none rounded-md bg-[#222] px-1.5 py-1 text-white'
      >
        <AiFillCamera className='inline' />
        <span className='align-top text-sm'>{cameraSpeed}</span>
      </a>
      <a
        className='mr-1 cursor-pointer rounded-md bg-[#222] px-1.5 py-1 text-white'
        onClick={() => (globalEditorStore.showCanvas = !showCanvas)}
      >
        {showCanvas ? <AiFillEye className='inline' /> : <AiFillEyeInvisible className='inline' />}
      </a>
      <a
        className='mr-1 cursor-pointer rounded-md bg-[#222] px-1.5 py-1 text-white'
        onClick={() => (globalEditorStore.uiMode = !uiMode)}
      >
        {uiMode ? <MdVideogameAsset className='inline' /> : <MdVideogameAssetOff className='inline' />}
      </a>
      {uiMode && (
        <>
          <a
            onClick={() => {
              if (uiGridNum == 8) {
                globalEditorStore.uiGridNum = 16;
              } else if (uiGridNum == 16) {
                globalEditorStore.uiGridNum = 24;
              } else if (uiGridNum == 24) {
                globalEditorStore.uiGridNum = 32;
              } else if (uiGridNum == 32) {
                globalEditorStore.uiGridNum = 64;
              } else if (uiGridNum == 64) {
                globalEditorStore.uiGridNum = 8;
              }
            }}
            className='ml-0.5 mr-1.5 cursor-pointer rounded-md bg-[#222] px-2.5 py-1 text-lg text-white'
          >
            {uiGridNum}
          </a>
        </>
      )}
    </div>
  );
};
const HelperControls = memo(_HelperControls);

/**
 * 補助機能
 */
const SystemHelper = () => {
  const { isGrid, isGizmo, isWorldHelper, cameraSpeed, cameraFar, worldGridSize, worldSize } =
    useSnapshot(globalEditorStore);
  const [minimal, setMinimal] = useState(true);
  const gridHelperSize = 4096;
  const divisions = worldGridSize;
  const cellSize = worldSize / divisions;
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

  if (isWorldHelper) {
    for (let i = 0; i < divisions; i++) {
      for (let j = 0; j < divisions; j++) {
        const number = i * divisions + j + 1;
        const textPosition = getCenterPosFromLayer(number, -0.01, worldSize, divisions);
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
      <MoveableCameraControl cameraSpeed={cameraSpeed} cameraFar={cameraFar} />
      {isGrid && <gridHelper args={[gridHelperSize, gridHelperSize]} />}
      {isGizmo && (
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

const ray = new Raycaster();
ray.firstHitOnly = true;
// Memo化
const ContextHelper = () => {
  const { camera, pointer, scene } = useThree();
  const editorState = useSnapshot(globalEditorStore);
  const { oms, addOM } = useNinjaEditor();
  // const pointer = useRef(new Vector2());
  const point = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onCreateMenu = async () => {
      // 最初に位置を決定する
      let position: Vector3 | undefined;
      // raycastでx,yの位置からpositionを計算
      ray.setFromCamera(pointer, camera);
      const intersects = ray.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        const pos = intersects[0].point;
        position = new Vector3(pos.x, pos.y, pos.z);
      }
      const data = await showSelectNewObjectDialog({
        x: point.current.x,
        y: point.current.y,
      });
      if (data && data.type) {
        const _om = addInitOM(oms.current, data.type, data.value);
        if (_om) {
          if (position) {
            _om.args.position = position;
          }
          addOM(_om);
        }
      }
    };
    const canvas = document.getElementById('mainviewcanvas');
    if (canvas && editorState.viewSelect === 'mainview') {
      document.addEventListener('keydown', (e) => {
        // SHIFT + A
        if (e.shiftKey && e.key === 'A') {
          // 押された時のpointerの位置を取得
          // -1 ~ +1の範囲
          onCreateMenu();
        }
      });
      // MouseMove
      canvas.addEventListener('mousemove', (e) => {
        point.current.x = e.clientX;
        point.current.y = e.clientY;
      });
      // TouchMove
      canvas.addEventListener('touchmove', (e) => {
        point.current.x = e.touches[0].clientX;
        point.current.y = e.touches[0].clientY;
      });
    }
    return () => {
      if (canvas) {
        document.removeEventListener('keydown', () => {});
        canvas.removeEventListener('mousemove', () => {});
        canvas.removeEventListener('touchmove', () => {});
      }
    };
  }, [oms, editorState.viewSelect, pointer, camera, scene.children, addOM]);

  return <></>;
};

// Memo化
const MemoContextHelper = memo(ContextHelper);

export const MainViewer = memo(_MainViewer);
