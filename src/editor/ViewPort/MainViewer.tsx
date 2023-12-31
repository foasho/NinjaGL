import { useState, useEffect, useRef, Suspense } from 'react';

import { GizmoHelper, GizmoViewport, Preload, Text } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import clsx from 'clsx';
import { Perf } from 'r3f-perf';
import { useTranslation } from 'react-i18next';
import { AiFillCamera, AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { ImEarth } from 'react-icons/im';
import { MdVideogameAsset, MdVideogameAssetOff } from 'react-icons/md';
import { TiSpanner } from 'react-icons/ti';
import Swal from 'sweetalert2';
import { Vector3, Color } from 'three';
import { useSnapshot } from 'valtio';

import { isNumber } from '@/commons/functional';
import { Loading2D } from '@/commons/Loading2D';
import { useNinjaEditor } from '@/hooks/useNinjaEditor';

import { MoveableCameraControl } from '../Common/MoveableCamera';
import { globalEditorStore } from '../Store/editor';
import { globalConfigStore } from '../Store/Store';

import { Cameras } from './MainViewItems/Cameras';
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
import { MemoLandScapeMaker } from './LandScapeMaker';

export const MainViewer = () => {
  const configState = useSnapshot(globalConfigStore);
  const editorState = useSnapshot(globalEditorStore);
  const [renderCount, setRenderCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isConfHovered, setIsConfHovered] = useState(false);
  // const cameraSpeedRef = useRef<HTMLInputElement>();
  const [cameraSpeed, setCameraSpeed] = useState<number>(1);
  const cameraFarRef = useRef<HTMLInputElement>(null);
  const [cameraFar, setCameraFar] = useState<number>(1000);
  const worldSize = 64;
  const worldGridSize = 8;
  const [uiGridNum, setUIGridNum] = useState<8 | 16 | 24 | 32>(8);
  const { onNJCChanged, offNJCChanged } = useNinjaEditor();
  // 水平グリッド
  const [isGrid, setIsGrid] = useState<boolean>(false);
  const [isWorldHelper, setIsWorldHelper] = useState<boolean>(true);
  const [isGizmo, setIsGizmo] = useState<boolean>(true);
  const [showCanvas, setShowCanvas] = useState<boolean>(true);
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
        <Canvas key={renderCount} style={{ display: showCanvas ? 'block' : 'none' }} id='mainviewcanvas' shadows>
          <Suspense fallback={null}>
            <MyLights />
            <StaticObjects />
            <Avatar />
            <MySky />
            <ThreeObjects />
            <Cameras />
            <FogComponent />
            <MyEnviroment />
            <MyText3Ds />
            <MyEffects />
            <MemoLandScapeMaker />
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
      <div
        className='absolute top-0 z-20 h-full w-full bg-white/50'
        style={{ display: editorState.uiMode ? 'block' : 'none' }}
      >
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
          onClick={() => (globalEditorStore.uiMode = !editorState.uiMode)}
        >
          {editorState.uiMode ? <MdVideogameAsset className='inline' /> : <MdVideogameAssetOff className='inline' />}
        </a>
        {editorState.uiMode && (
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
              className='ml-0.5 mr-1.5 cursor-pointer rounded-md bg-[#222] px-2.5 py-1 text-lg text-white'
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
      <MoveableCameraControl cameraSpeed={props.cameraSpeed} cameraFar={props.cameraFar} />
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
