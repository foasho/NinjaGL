import * as React from 'react';
import { IConfigParams, IInputMovement, IObjectManagement, IScriptManagement, ITextureManagement, IUIManagement } from '../utils/NinjaProps';
import { InitMobileConfipParams } from '../utils/NinjaInit';
import { NJCFile, loadNJCFileFromURL } from '../utils/NinjaFileControl';
import { Camera, Group, Mesh, Object3D, Vector3 } from 'three';
import { Canvas as NCanvas, useFrame as useNFrame } from '@react-three/fiber';
import { useInputControl } from './useInputControl';
import { Loading3D } from '../loaders/Loading3D';
import { Loading2D } from '../loaders/Loading2D';
import { OMEnvirments } from '../canvas-items/OMEnvironments';
import { OMEffects } from '../canvas-items/OMEffects';
import { OMObjects } from '../canvas-items/OMObject';
import { Cameras } from '../canvas-items/OMCamera';
import { NWorkerProp, useNinjaWorker } from './useNinjaWorker';
import { OMPlayer } from '../canvas-items/OMPlayer';

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
  player: React.MutableRefObject<Mesh|null>,
  colGrp: Group|null,
  scriptWorker: NWorkerProp,
  input: IInputMovement,
  oms: IObjectManagement[],
  sms: IScriptManagement[],
  ums: IUIManagement[],
  tms: ITextureManagement[],
  setOMObjectById: (id: string, obj: Object3D) => void,
  getOMById: (id: string) => IObjectManagement|null,
  getOMByName: (name: string) => IObjectManagement|null,
  getSMById: (id: string) => IScriptManagement|null,
}
export const NinjaEngineContext = React.createContext<NinjaEngineProp>({
  status: ENinjaStatus.Pause,
  phyWorldType: EPhyWorldType.None,
  player: React.createRef<Mesh>(),
  colGrp: null,
  scriptWorker: {
    loadUserScript: async () => { },
    runFrameLoop: () => { },
    runInitialize: () => { },
  },
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
  setOMObjectById: () => { },
  getOMById: () => null,
  getOMByName: () => null,
  getSMById: () => null,
} as NinjaEngineProp);

export const useNinjaEngine = () => React.useContext(NinjaEngineContext);

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
  noCanvas?: boolean;
  children?: React.ReactNode;
}
export const ThreeJSVer = '0.154.0';
export const NinjaGL = ({ 
  njc,
  njcPath,
  noCanvas = false,
  children,
}: INinjaEngineProvider
) => {
  const [init, setInit] = React.useState(false);
  const [status, setStatus] = React.useState<ENinjaStatus>(ENinjaStatus.Pause);
  // coreファイル
  const [njcFile, setNjcFile] = React.useState<NJCFile|null>(null);
  // Loading周り
  const loadingPercentage = React.useRef<number>(0);
  const cameraLayer = React.useRef<number>(1);
  // ユーザー設定
  const [config, setConfig] = React.useState<IConfigParams>(InitMobileConfipParams);
  const [device, setDevice] = React.useState<EDeviceType>(EDeviceType.Unknown);
  // コンテンツ管理
  const [oms, setOMs] = React.useState<IObjectManagement[]>([]);
  const [ums, setUMs] = React.useState<IUIManagement[]>([]);
  const [tms, setTMs] = React.useState<ITextureManagement[]>([]);
  const [sms, setSMs] = React.useState<IScriptManagement[]>([]);
  // 可視化管理 / 動態管理
  const visibleOmKeys = React.useRef<string[]>([]);
  const movementOmKeys = React.useRef<string[]>([]);
  // Playerメッシュ
  const player = React.useRef<Mesh>(null);
  // 物理世界
  const [phyWorldType, setPhyWorldType] = React.useState<EPhyWorldType>(EPhyWorldType.None);
  const colGrp = React.useRef<Group>(null); // BVH用/Octree用コライダー
  // 汎用入力
  const { input, attachJumpBtn, attachRunBtn } = useInputControl({});
  // Debugツリー
  const debugTree = React.useRef<any>(null);
  // スクリプトワーカー(NinjaWokrer)
  const scriptWorker = useNinjaWorker({ ThreeJSVer });

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (init){
      // 1. 初期設定完了後にPhyWold/ScriptWorkerの設置アップ
      scriptWorker.loadUserScript(sms);
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
      player,
      colGrp: colGrp.current,
      oms,
      sms,
      ums,
      tms,
      setOMObjectById,
      getOMById,
      getOMByName,
      getSMById,
    }}>
      {init && njcFile &&
        <>
          {!noCanvas ?
            <NCanvas>
              <React.Suspense fallback={<Loading3D isLighting position={[0, 0, 3]} />}>
                <NinjaCanvasItems/>
                {children}
              </React.Suspense>
            </NCanvas>
            :
            <>
              {children}
            </>
          }
          {/** UIレンダリング */}

        </>
      }
      {!init && !noCanvas &&
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
export const NinjaCanvas = ({ children }) => (<NCanvas>{children}</NCanvas>)
export const NinjaCanvasItems = () => {
  return (
    <>
      {/** OMのID */}
      <OMObjects />
      {/** エフェクト */}
      <OMEffects />
      {/** 環境 */}
      <OMEnvirments />
      {/** カメラ */}
      <Cameras />
      {/** Player */}
      <OMPlayer />
      <group>
        <SystemFrame/>
      </group>
    </>
  )
}


/**
 * システムフレーム(時間をすすめる)
 */
const SystemFrame = () => {

  const { 
    status,
    phyWorldType,
    scriptWorker,
    colGrp,
    input,
    oms,
    sms,
  } = useNinjaEngine();

  // BVHの更新
  const updateBVHWorld = (camera: Camera, timeDelta: number) => {

    // if (player.current && controls.current && mergeGeometry) {
    //   /**
    //    * 処理順序
    //    * 1. 入力データから移動方向ベクトルを計算
    //    * 　- 接地しているかどうか -> 重力分の移動ベクトルを追加
    //    * 　-
    //    * 2. 衝突検出
    //    *
    //    */
    //   if (playerIsOnGround.current) {
    //     playerVelocity.current.y = delta * gravity
    //   } else {
    //     playerVelocity.current.y += delta * gravity
    //   }
    //   player.current.position.addScaledVector(playerVelocity.current, delta)

    //   // 移動
    //   let speed = baseSpeed * input.speed
    //   if (input.dash) {
    //     speed *= dashRatio
    //   }
    //   const angle = controls.current.getAzimuthalAngle()
    //   let forwardAmount = input.forward - input.backward
    //   let movementVector = new Vector3(0, 0, 0)
    //   if (forwardAmount !== 0) {
    //     tempVector.set(0, 0, -1 * forwardAmount).applyAxisAngle(upVector, angle)
    //     player.current.position.addScaledVector(tempVector, speed * delta)
    //     movementVector.add(tempVector)
    //   }
    //   let rightAmount = input.right - input.left
    //   if (rightAmount !== 0) {
    //     tempVector.set(rightAmount, 0, 0).applyAxisAngle(upVector, angle)
    //     player.current.position.addScaledVector(tempVector, speed * delta)
    //     movementVector.add(tempVector)
    //   }
    //   player.current.updateMatrixWorld()

    //   // 移動量があれば、その移動方向に応じてObjectのY軸を回転させる
    //   if (forwardAmount !== 0 || rightAmount !== 0) {
    //     const targetRotation = Math.atan2(movementVector.x, movementVector.z)
    //     object.current!.rotation.y = targetRotation
    //   }

    //   /**
    //    * 衝突検出
    //    */
    //   if (collider.current && capsuleInfo.current) {
    //     tempBox.makeEmpty()
    //     tempMat.copy(collider.current.matrixWorld).invert()
    //     tempSegment.copy(capsuleInfo.current.segment)

    //     // ローカル空間内のユーザーの位置を取得
    //     tempSegment.start.applyMatrix4(player.current.matrixWorld).applyMatrix4(tempMat)
    //     tempSegment.end.applyMatrix4(player.current.matrixWorld).applyMatrix4(tempMat)
    //     // 軸が整列した境界ボックスを取得
    //     tempBox.expandByPoint(tempSegment.start)
    //     tempBox.expandByPoint(tempSegment.end)

    //     tempBox.min.addScalar(-capsuleInfo.current.radius)
    //     tempBox.max.addScalar(capsuleInfo.current.radius)

    //     // 衝突を検出
    //     collider.current!.geometry!.boundsTree!.shapecast({
    //       intersectsBounds: (_box: Box3) => {
    //         return _box.intersectsBox(tempBox)
    //       },
    //       intersectsTriangle: (tri) => {
    //         const triPoint = tempVector
    //         const capsulePoint = tempVector2
    //         const distance = tri.closestPointToSegment(tempSegment, triPoint, capsulePoint)
    //         if (distance < capsuleInfo.current!.radius) {
    //           const depth = capsuleInfo.current!.radius - distance
    //           const direction = capsulePoint.sub(triPoint).normalize()
    //           tempSegment.start.addScaledVector(direction, depth)
    //           tempSegment.end.addScaledVector(direction, depth)
    //         }
    //       }
    //     })
    //   }

    //   const newPosition = tempVector
    //   newPosition.copy(tempSegment.start).applyMatrix4(collider.current!.matrixWorld)

    //   const deltaVector = tempVector2
    //   deltaVector.subVectors(newPosition, player.current.position)

    //   playerIsOnGround.current = deltaVector.y > Math.abs(delta * playerVelocity.current.y * 0.25)

    //   const offset = Math.max(0.0, deltaVector.length() - 1e-5)
    //   deltaVector.normalize().multiplyScalar(offset)

    //   // Player(Capsule)とObjectの位置を同期
    //   player.current.position.add(deltaVector)
    //   if (object.current) {
    //     object.current.position.copy(player.current.position.clone().add(new Vector3(0, -(height - capsuleInfo.current!.radius), 0)))
    //   }
    //   if (!playerIsOnGround.current) {
    //     deltaVector.normalize()
    //     playerVelocity.current.addScaledVector(deltaVector, -deltaVector.dot(playerVelocity.current))
    //   } else {
    //     playerVelocity.current.set(0, 0, 0)
    //   }

    //   // カメラとの距離を調整
    //   camera.position.sub(controls.current.target)
    //   controls.current.target.copy(player.current.position)
    //   camera.position.add(player.current.position)

    //   // CameraからPlayerに向けてRaycastを行い、障害物があればカメラを障害物の位置に移動
    //   const objectPosition = player.current.position.clone().add(new Vector3(0, height / 2, 0))
    //   const direction = objectPosition.clone().sub(camera.position.clone()).normalize()
    //   const distance = camera.position.distanceTo(objectPosition)
    //   raycaster.set(camera.position, direction) // Raycast起源点をカメラに
    //   raycaster.far = distance - height / 2
    //   raycaster.near = 0.01
    //   raycaster.firstHitOnly = true
    //   const intersects = raycaster.intersectObject(collider.current!, true) // 全てのオブジェクトを対象にRaycast
    //   if (intersects.length > 0) {
    //     // 複数のオブジェクトに衝突した場合、distanceが最も近いオブジェクトを選択
    //     const target = intersects.reduce((prev, current) => {
    //       return prev.distance < current.distance ? prev : current
    //     })
    //     // この処理が完璧でないため、コメントアウト
    //     // camera.position.copy(target.point)
    //   } else if (forwardAmount !== 0 || rightAmount !== 0) {
    //     // 障害物との交差がない場合はプレイヤーから一定の距離を保つ
    //     const directionFromPlayerToCamera = camera.position.clone().sub(objectPosition).normalize()
    //     // カメラの位置をプレイヤーから一定の距離を保つように調整※カメラのカクツキを防ぐためにLerpを使用
    //     camera.position.lerp(objectPosition.clone().add(directionFromPlayerToCamera.multiplyScalar(desiredDistance)), 0.1)
    //   }

    //   // デッドゾーンまで落ちたらリセット
    //   if (player.current.position.y < deadZone) {
    //     reset()
    //   }
    // }

  }

  // Octreeの更新
  const updateOctreeWorld = (timeDelta: number) => {
    // 調整中...
  }

  // フレームの更新
  useNFrame((state, delta) => {
    if (status === ENinjaStatus.Pause){
      return;
    }
    const { camera } = state;
    // 1. 可視化管理の更新
    // updateVisibleObject();
    // 2. 物理時間の更新
    if (phyWorldType === EPhyWorldType.BVH){
      updateBVHWorld(camera, delta);
    }
    if (phyWorldType === EPhyWorldType.Octree){
      updateOctreeWorld(delta);
    }
    // 3. ユーザースクリプトの更新
    if (scriptWorker){
      sms.forEach((sm) => {
        scriptWorker.runFrameLoop(
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
    </>
  )
}
