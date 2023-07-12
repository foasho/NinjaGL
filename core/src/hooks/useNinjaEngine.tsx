import React, { Suspense, createContext, useContext, useEffect, useRef, useState } from 'react';
import { IConfigParams, IInputMovement, IObjectManagement, IScriptManagement, ITextureManagement, IUIManagement } from '../utils/NinjaProps';
import { InitMobileConfipParams } from '../utils/NinjaInit';
import { NinjaEngineWorker } from '../utils/NinjaEngineWorker';
import { NJCFile, loadNJCFileFromURL } from '../utils/NinjaFileControl';
import { Group, Object3D, Vector3 } from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useInputControl } from './useInputControl';
import { Loading3D } from '../loaders/Loading3D';
import { Preload } from '@react-three/drei';
import { Loading2D } from '../loaders/Loading2D';
import { MyEnvirments } from '../canvas-items/OMEnvironments';
import { MyEffects } from '../canvas-items/OMEffects';
import { OMObject } from '../canvas-items/OMObject';
import { Cameras } from '../canvas-items/OMCamera';

export enum EPhyWorldType {
  None = 0,
  Octree = 1,
  BVH = 2,
}

export enum EDeviceType {
  Unknown = 0,
  Desktop = 1,
  Tablet = 2,
  Mobile = 3,
}

export enum ENinjaStatus {
  Play = 0,
  Pause = 1,
}

type NinjaEngineProp = {
  status: ENinjaStatus,
  phyWorldType: EPhyWorldType,
  scriptWorker: React.MutableRefObject<NinjaEngineWorker|null>,
  input: IInputMovement,
  oms: IObjectManagement[],
  sms: IScriptManagement[],
  ums: IUIManagement[],
  tms: ITextureManagement[],
  setOMObjectById: (id: string, obj: Object3D) => void,
}
const NinjaEngineContext = createContext<NinjaEngineProp>({
  status: ENinjaStatus.Pause,
  phyWorldType: EPhyWorldType.None,
  scriptWorker: {current: null},
  input: {
    forward: 0,
    backward: 0,
    left: 0,
    right: 0,
    jump: false,
    dash: false,
    action: false,
    prevDrag: null,
    curDrag: null,
    speed: 0,
    pressedKeys: [],
    angleAxis: [0, 0],
  },
  oms: [],
  sms: [],
  ums: [],
  tms: [],
  setOMObjectById: () => {},
} as NinjaEngineProp);

export const useNinjaEngine = () => useContext(NinjaEngineContext);

export const detectDeviceType = (): EDeviceType => {
 if (typeof window !== 'undefined') {  // check if window is defined (we are on client side)
   const ua = navigator.userAgent;
   if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || (ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0)) {
     return EDeviceType.Mobile;
   } 
   else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
     return EDeviceType.Tablet;
   }
   else if (
     navigator.maxTouchPoints &&
     navigator.maxTouchPoints > 2 &&
     /MacIntel/.test(navigator.platform)
   ) {
     return EDeviceType.Tablet;
   }
   else {
     return EDeviceType.Desktop;
   }
 } else {
   return EDeviceType.Unknown;  // as a default, return "desktop" when window is not defined (we are on server side)
 }
};

/**
 * Canvas(@react-three/fiber)内部に設置するProvider
 * ex): 
 * <Canvas>
 *  <NinjaEngineProvider/>
 * </Canvas>
 */
interface INinjaEngineProvider {
  njc?: NJCFile|null;
  njcPath?: string;
  children?: React.ReactNode;
}
export const NinjaGL = ({ 
  njc,
  njcPath,
  children,
}: INinjaEngineProvider
) => {
  const [init, setInit] = useState(false);
  const [status, setStatus] = useState<ENinjaStatus>(ENinjaStatus.Pause);
  // coreファイル
  const [njcFile, setNjcFile] = useState<NJCFile|null>(null);
  // Loading周り
  const loadingPercentage = useRef<number>(0);
  const cameraLayer = useRef<number>(1);
  // ユーザー設定
  const [config, setConfig] = useState<IConfigParams>(InitMobileConfipParams);
  const [device, setDevice] = useState<EDeviceType>(EDeviceType.Unknown);
  // コンテンツ管理
  const [oms, setOMs] = useState<IObjectManagement[]>([]);
  const [ums, setUMs] = useState<IUIManagement[]>([]);
  const [tms, setTMs] = useState<ITextureManagement[]>([]);
  const [sms, setSMs] = useState<IScriptManagement[]>([]);
  // 可視化管理 / 動態管理
  const visibleOmKeys = useRef<string[]>([]);
  const movementOmKeys = useRef<string[]>([]);
  // 物理世界
  const [phyWorldType, setPhyWorldType] = useState<EPhyWorldType>(EPhyWorldType.None);
  const bvhGrp = useRef<Group>(null); // BVH用コライダー
  // 汎用入力
  const { input, attachJumpBtn, attachRunBtn } = useInputControl({});
  // Debugツリー
  const debugTree = useRef<any>(null);
  // スクリプトワーカー
  const scriptWorker = useRef<NinjaEngineWorker|null>(null);

  useEffect(() => {
    // njcが指定されていればそのままセット
    if (njc && !njcFile){
      setNjcFile(njc);
    }
    // njcPathが指定されていれば読み込み
    if (njcPath && !njcFile){
      console.log(njcPath);
      loadNJCFile(njcPath);
    }
    // njcFileが設定済みなら初期設定を行う
    if (njcFile){
      // 1. 接続デバイスを判定する
      setDevice(detectDeviceType());
      // 2. NinjaEngineWorkerを生成する
      scriptWorker.current = new NinjaEngineWorker(this);
      // 3. Coreファイルを読み込む
      setOMs(njcFile.oms);
      setUMs(njcFile.ums);
      setTMs(njcFile.tms);
      setSMs(njcFile.sms);
      if (njcFile.config){
        setConfig(njcFile.config);
      }
      setInit(true);
    }
  }, [njcFile, njc, njcPath]);

  useEffect(() => {
    if (init){
      // 1. 初期設定完了後にPhyWold/ScriptWorkerの設置アップ
      if (scriptWorker.current){
        scriptWorker.current.loadUserScript(sms);
      }
    }
  }, [init]);

  /**
   * njcPathからFileをロード
   */
  const loadNJCFile = async (path: string) => {
    const startTime = new Date().getTime();
    const data = await loadNJCFileFromURL(path);
    const endTime = new Date().getTime();
    console.info(`<< LoadedTime: ${endTime - startTime}ms >>`);
    setNjcFile(data);
    console.log(data);
  }

  /**
   * ----------------------------------------
   * Functions for NinjaEngineWorker
   * ----------------------------------------
   */
  // IDからOMを取得する
  const getOMById = (id: string): IObjectManagement|null => {
    const om = oms.find((om) => om.id === id);
    if (om){
      return om;
    }
    return null;
  }
  // 名前からOMを取得する
  const getOMByName = (name: string): IObjectManagement|null => {
    const om = oms.find((om) => om.name === name);
    if (om){
      return om;
    }
    return null;
  }
  // 特定のOMにObject3Dを追加する
  const setOMObjectById = (id: string, obj: Object3D) => {
    const om = oms.find((om) => om.id === id);
    if (om){
      om.object = obj;
    }
  }
  // IDからSMを取得する
  const getSMById = (id: string): IScriptManagement|null => {
    const sm = sms.find((sm) => sm.id === id);
    if (sm){
      return sm;
    }
    return null;
  }

  
  const updateVisibleObject = (playerPosition: Vector3, hiddenDistance: number) => {
    // プレイヤーから一定距離内にあるOMをvisibleにする。また、一定距離外にあるOMをhiddenにする
    // 調整中...
  }

  return (
    <NinjaEngineContext.Provider value={{
      status,
      phyWorldType,
      scriptWorker,
      input,
      oms,
      sms,
      ums,
      tms,
      setOMObjectById,
    }}>
      {init && njcFile &&
        <>
          <Canvas>
            <Suspense fallback={<Loading3D isLighting position={[0, 0, 3]} />}>
              <NinjaCanvas/>
              {children}
            </Suspense>
            <Preload all />
          </Canvas>
          {/** UIレンダリング */}

        </>
      }
      {!init &&
        <>
          {/** ローディング */}
          <Loading2D />
        </>
      }
    </NinjaEngineContext.Provider>
  )
}

/**
 * Canvasレンダリング
 */
export const NinjaCanvas = () => {

  const { 
    status,
    phyWorldType,
    scriptWorker,
    input,
    oms,
    sms,

  } = useNinjaEngine();

  // フレームの更新
  useFrame((state, delta) => {
    if (status === ENinjaStatus.Pause){
      return;
    }
    // 1. 可視化管理の更新
    // updateVisibleObject();
    // 2. 物理時間の更新
    if (phyWorldType === EPhyWorldType.BVH){
      // updateBVHWorld(timeDelta);
    }
    if (phyWorldType === EPhyWorldType.Octree){
      // updateOctreeWorld(timeDelta);
    }
    // 3. ユーザースクリプトの更新
    if (scriptWorker.current){
      sms.forEach((sm) => {
        scriptWorker.current.runFrameLoop(
          sm.id,
          state,
          delta,
          input
        );
      });
    }
  });

  return (
    <>
      {/** テストケース */}
      <TestCase3D />
      {/** OMのID */}
      {oms.map((om) => 
        <OMObject om={om} key={om.id}/>
      )}
      {/** エフェクト */}
      <MyEffects oms={oms} />
      {/** 環境 */}
      <MyEnvirments oms={oms} />
      {/** カメラ */}
      <Cameras oms={oms} />
    </>
  )
}

export const TestCase3D = () => {

  return (
    <>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
      <ambientLight />
    </>
  )
}
