import React, { Suspense, useEffect, useRef } from "react";
import {
  IConfigParams,
  IObjectManagement,
  IScriptManagement,
  ITextureManagement,
  IUIManagement,
  InitMobileConfipParams,
  NonColliderTunnel,
  NJCFile,
  loadNJCFileFromURL,
  ConvPos,
  DefaultAvatar,
  genRandom,
  loadNJCFileFromPath,
  MessageProps,
  PlayerInfoProps,
} from "../utils";
import {
  Box3,
  Group,
  Line3,
  Matrix4,
  Mesh,
  Object3D,
  Sphere,
  Vector3,
} from "three";
import { Canvas as NCanvas, useFrame as useNFrame } from "@react-three/fiber";
import { InputControlProvider, useMultiInputControl } from "./useInputControl";
import { Loading3D, Loading2D } from "../loaders";
import {
  OMEffects,
  OMObjects,
  Cameras,
  ColliderField,
  OMEnvirments,
  StaticObjects,
  OMAudios,
  AiNPCs,
  MultiPlayer,
  OMWaters,
} from "../canvas-items";
import { NinjaWorkerProvider, useNinjaWorker } from "./useNinjaWorker";
import { DebugComponent, MemoSplashScreen } from "../commons";
import { Moveable } from "../canvas-items/Moveables";
import { MeshBVH } from "three-mesh-bvh";
import { Capsule } from "three-stdlib";
import { UIItems } from "../uis";
import { NinjaKVSProvider } from "./useKVS";
import { MemoWebRTCProvider } from "./useWebRTC";
import { Perf } from "r3f-perf";
import { Water } from "../canvas-items/Water";

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
  init: boolean;
  device: EDeviceType;
  isVertical: boolean;
  status: React.MutableRefObject<ENinjaStatus>;
  isPhysics: boolean;
  player: React.MutableRefObject<Mesh | null>;
  playerInfo: React.MutableRefObject<PlayerInfoProps>;
  playerIsOnGround: React.MutableRefObject<boolean>;
  curMessage: React.MutableRefObject<string>;
  npcChatHistory: React.MutableRefObject<MessageProps[]>;
  isSound: boolean;
  setIsSound: (isSound: boolean) => void;
  bvhGrp: React.MutableRefObject<Group | null>;
  bvhCollider: React.MutableRefObject<Mesh | null>;
  moveGrp: React.MutableRefObject<Group | null>;
  shareGrp: React.MutableRefObject<Group | null>;
  boundsTree: React.MutableRefObject<MeshBVH | null>;
  updateCollisions: (daltaTime: number) => void;
  config: IConfigParams;
  apiEndpoint: string;
  oms: IObjectManagement[];
  sms: IScriptManagement[];
  ums: IUIManagement[];
  tms: ITextureManagement[];
  getOMById: (id: string) => IObjectManagement | null;
  getOMByName: (name: string) => IObjectManagement | null;
  getSMById: (id: string) => IScriptManagement | null;
  setArg: (id: string, key: string, arg: any) => void;
  addOM: (om: IObjectManagement) => void;
  onOMIdChanged: (id: string, listener: () => void) => void;
  offOMIdChanged: (id: string, listener: () => void) => void;
  onOMsChanged: (listener: () => void) => void;
  offOMsChanged: (listener: () => void) => void;
};
export const NinjaEngineContext = React.createContext<NinjaEngineProp>({
  init: false,
  device: EDeviceType.Unknown,
  isVertical: false,
  status: React.createRef<ENinjaStatus>(),
  isPhysics: true,
  player: React.createRef<Mesh>(),
  playerInfo: React.createRef<PlayerInfoProps>(),
  playerIsOnGround: React.createRef<boolean>(),
  curMessage: React.createRef<string>(),
  npcChatHistory: React.createRef<MessageProps[]>(),
  isSound: false,
  setIsSound: (isSound: boolean) => {},
  bvhGrp: React.createRef<Group>(),
  bvhCollider: React.createRef<Mesh>(),
  moveGrp: React.createRef<Group>(),
  shareGrp: React.createRef<Group>(),
  boundsTree: React.createRef<Object3D>(),
  updateCollisions: (daltaTime: number) => {},
  config: InitMobileConfipParams,
  apiEndpoint: "",
  oms: [],
  sms: [],
  ums: [],
  tms: [],
  getOMById: () => null,
  getOMByName: () => null,
  getSMById: () => null,
  setArg: () => {},
  addOM: () => {},
  onOMIdChanged: () => {},
  offOMIdChanged: () => {},
  onOMsChanged: () => {},
  offOMsChanged: () => {},
} as NinjaEngineProp);

export const useNinjaEngine = () => React.useContext(NinjaEngineContext);

export const detectDeviceType = (): EDeviceType => {
  if (typeof window !== "undefined") {
    // check if window is defined (we are on client side)
    const ua = navigator.userAgent;
    if (
      ua.indexOf("iPhone") > 0 ||
      ua.indexOf("iPod") > 0 ||
      (ua.indexOf("Android") > 0 && ua.indexOf("Mobile") > 0)
    ) {
      return EDeviceType.Mobile;
    } else if (ua.indexOf("iPad") > 0 || ua.indexOf("Android") > 0) {
      return EDeviceType.Tablet;
    } else if (
      navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 2 &&
      /MacIntel/.test(navigator.platform)
    ) {
      return EDeviceType.Tablet;
    } else {
      return EDeviceType.Desktop;
    }
  } else {
    return EDeviceType.Unknown; // as a default, return "desktop" when window is not defined (we are on server side)
  }
};

/**
 * Canvas(@react-three/fiber)内部に設置するProvider
 * ex):
 * <Canvas>
 *  <NinjaEngineProvider/>
 * </Canvas>
 */
export interface INinjaGL {
  njc?: NJCFile | null;
  njcPath?: string;
  noCanvas?: boolean;
  isSplashScreen?: boolean;
  apiEndpoint?: string;
  initPlayerInfo?: PlayerInfoProps;
  children?: React.ReactNode;
}
export const ThreeJSVer = "0.157.0";
const _NinjaGL = ({
  njc,
  njcPath,
  noCanvas = false,
  isSplashScreen = true,
  apiEndpoint = "",
  initPlayerInfo = {
    name: `Guest`,
    avatar: DefaultAvatar,
    objectURL: undefined,
    cameraMode: "third",
  },
  children,
}: INinjaGL) => {
  /**
   * 可能な限り再レンダリングされないようにuseStateは最低限
   */
  // core設定
  const [njcFile, setNjcFile] = React.useState<NJCFile | null>(null);
  const [init, setInit] = React.useState(false);
  const status = React.useRef<ENinjaStatus>(ENinjaStatus.Pause);
  const [isSound, setIsSound] = React.useState<boolean>(false); // サウンドの有効/無効
  // コンテンツ管理
  const [Contents, setContents] = React.useState<{
    config: IConfigParams;
    oms: IObjectManagement[];
    sms: IScriptManagement[];
    ums: IUIManagement[];
    tms: ITextureManagement[];
    device: EDeviceType;
    isVertical: boolean;
    token?: string;
  }>({
    config: InitMobileConfipParams,
    oms: [],
    sms: [],
    ums: [],
    tms: [],
    device: EDeviceType.Unknown,
    isVertical: false,
    token: undefined,
  });
  const { config, oms, sms, ums, tms, device, isVertical, token } = Contents;
  // Player情報
  const player = React.useRef<Mesh>(null);
  const playerInfo = useRef<PlayerInfoProps>(initPlayerInfo);
  const playerIsOnGround = useRef(false);
  const curMessage = React.useRef<string>("");
  // NPC用Chat履歴
  const npcChatHistory = React.useRef<MessageProps[]>([]);
  // 物理エンジン用
  const bvhGrp = React.useRef<Group>(null); // BVH用コライダー
  const bvhCollider = React.useRef<Mesh>(null); // BVH用コライダー
  const moveGrp = React.useRef<Group>(null); // 移動用コライダー
  const shareGrp = React.useRef<Group>(null); // MultiPlayer共有用コライダー
  const boundsTree = React.useRef<MeshBVH>(null); // BVH-boundsTree

  React.useEffect(() => {
    const loadNjc = async () => {
      // njcPathが指定されていれば読み込み
      if (njcPath && !njcFile) {
        const _njcFile = await loadNJCFileFromPath(njcPath);
        setNjcFile(_njcFile);
        return;
      }
    };
    // njcが指定されていれば読み込み
    if (njc && !njcFile) {
      setNjcFile(njc);
    } else {
      loadNjc();
    }
  }, [njcPath, njc]);

  React.useEffect(() => {
    const fetchToken = async () => {
      const res = await fetch(apiEndpoint + "/api/skyway/token");
      const response = await res.json();
      if (res.status === 200 && response.data) {
        return response.data;
      }
      return undefined;
    };
    const setup = async () => {
      // njcFileが設定済みなら初期設定を行う
      if (njcFile) {
        let _token = undefined;
        if (njcFile.config.multi) {
          try {
            // MultiPlayerの場合は、SkyWayのトークンを取得する
            _token = await fetchToken();
          } catch (e) {
            // 強制的にmultiをfalseにする
            njcFile.config.multi = false;
          }
        }
        setContents({
          config: njcFile.config,
          oms: njcFile.oms,
          sms: njcFile.sms,
          ums: njcFile.ums,
          tms: njcFile.tms,
          device: detectDeviceType(),
          isVertical: window.innerHeight > window.innerWidth,
          token: _token,
        });
        setInit(true);
      }
    };
    if (njcFile) {
      setup();
    }
    document.addEventListener(
      "contextmenu",
      function (event) {
        event.preventDefault();
      },
      false
    );
    return () => {
      document.removeEventListener(
        "contextmenu",
        function (event) {
          event.preventDefault();
        },
        false
      );
    };
  }, [njcFile, njc]);

  console.info("NinjaGL Redeendered");

  React.useEffect(() => {
    if (init) {
      // 1. 初期設定完了後にPhyWold/ScriptWorkerの設置アップ
      // scriptWorker.loadUserScript(sms);
      setTimeout(() => {
        status.current = ENinjaStatus.Play;
      }, 3000);
    }
  }, [init]);

  /**
   * ----------------------------------------
   * Functions for NinjaEngineWorker
   * ----------------------------------------
   */
  // IDからOMを取得する
  const getOMById = (id: string): IObjectManagement | null => {
    const om = oms.find((om) => om.id === id);
    if (om) {
      return om;
    }
    return null;
  };
  // 名前からOMを取得する
  const getOMByName = (name: string): IObjectManagement | null => {
    const om = oms.find((om) => om.name === name);
    if (om) {
      return om;
    }
    return null;
  };
  // IDからSMを取得する
  const getSMById = (id: string): IScriptManagement | null => {
    const sm = sms.find((sm) => sm.id === id);
    if (sm) {
      return sm;
    }
    return null;
  };
  const setArg = (id: string, key: string, arg: any, offListenser = false) => {
    const om = oms.find((om) => om.id === id);
    if (om) {
      // argsが異なれば、更新する
      if (om.args[key] !== arg) {
        if (["position", "scale", "velocity"].includes(key)) {
          om.args[key] = ConvPos(arg);
        } else {
          om.args[key] = arg;
        }
        if (!offListenser) notifyOMIdChanged(id);
      }
    }
  };
  const addOM = (om: IObjectManagement, multiShare = true) => {
    oms.push(om);
    if (multiShare) {
      // multiplayer利用時は、他のクライアントにもOMを追加する
      // TODO: 他のクライアントにOMを追加する
    }
    notifyOMsChanged();
  };

  // Listenerを作成
  /**
   * 個別のOM変更リスナー
   */
  const objectManagementIdChangedListeners = useRef<{
    [id: string]: (() => void)[];
  }>({});
  const onOMIdChanged = (id: string, listener: () => void) => {
    if (!objectManagementIdChangedListeners.current[id]) {
      objectManagementIdChangedListeners.current[id] = [];
    }
    objectManagementIdChangedListeners.current[id].push(listener);
  };
  const offOMIdChanged = (id: string, listener: () => void) => {
    if (!objectManagementIdChangedListeners.current[id]) {
      return;
    }
    objectManagementIdChangedListeners.current[id] =
      objectManagementIdChangedListeners.current[id].filter(
        (l) => l !== listener
      );
  };
  // 特定のOM変更を通知する
  const notifyOMIdChanged = (id: string) => {
    if (!objectManagementIdChangedListeners.current[id]) {
      return;
    }
    objectManagementIdChangedListeners.current[id].forEach((l) => l());
  };
  /**
   * OMsの変更リスナー
   */
  const objectManagementChangedListeners = useRef<(() => void)[]>([]);
  const onOMsChanged = (listener: () => void) => {
    objectManagementChangedListeners.current.push(listener);
  };
  const offOMsChanged = (listener: () => void) => {
    objectManagementChangedListeners.current =
      objectManagementChangedListeners.current.filter((l) => l !== listener);
  };
  // OMsの変更を通知する
  const notifyOMsChanged = () => {
    objectManagementChangedListeners.current.forEach((l) => l());
  };

  const gravity = -9.8;
  const deadBoxY = -80;
  const tempBox = new Box3();
  const tempSphere = new Sphere();
  const tempCapsule = new Capsule();
  const tempSegment = new Line3();
  const tempVec = new Vector3();
  const tempVector = new Vector3();
  const tempVector2 = new Vector3();
  const tempMat = new Matrix4();
  const deltaVec = new Vector3();
  const colliders = [];
  const updateCollisions = (deltaTime: number) => {
    if (!bvhCollider.current) return;
    if (!moveGrp.current) return;
    if (!boundsTree.current) return;
    // 衝突判定
    for (const object of moveGrp.current.children) {
      // TODO: ここで、移動可能なオブジェクトの衝突判定を行う
      const om = getOMById(object.userData.omId);
      if (!om) return;
      let collider;
      // DeadBoxに入ったら、処理をスキップする
      if (object.position.y < deadBoxY) {
        continue;
      }
      if (!om.args.velocity) {
        om.args.velocity = new Vector3(0, 0, 0);
      }
      let radius = 0.5;
      if (om.phyType === "box") {
        const position = object.position.clone();
        const min = position
          .clone()
          .sub(object.scale.clone().multiplyScalar(0.5));
        const max = position
          .clone()
          .add(object.scale.clone().multiplyScalar(0.5));
        collider = new Box3(min, max);
        tempBox.copy(collider);

        om.args.velocity.y += gravity * deltaTime;
        collider.min.addScaledVector(om.args.velocity, deltaTime);
      } else if (om.phyType === "sphere") {
        collider = new Sphere(
          om.args.position || new Vector3(0, 0, 0),
          om.args.radius || 1
        );
        tempSphere.copy(collider);
        om.args.velocity.y += gravity * deltaTime;
        collider.center.addScaledVector(om.args.velocity, deltaTime);
      } else if (om.phyType === "capsule") {
        tempBox.makeEmpty();
        tempMat.copy(bvhCollider.current.matrixWorld).invert();
        const sizeBox = new Box3().setFromObject(object);
        const height = sizeBox.max.y - sizeBox.min.y;
        radius = Math.max(sizeBox.max.x, sizeBox.max.z);
        const segment = new Line3(
          new Vector3(),
          new Vector3(0, -height / 2, 0.0)
        );
        tempSegment.copy(segment);

        // ローカル空間内のユーザーの位置を取得
        tempSegment.start
          .applyMatrix4(object.matrixWorld)
          .applyMatrix4(tempMat);
        tempSegment.end.applyMatrix4(object.matrixWorld).applyMatrix4(tempMat);
        // 軸が整列した境界ボックスを取得
        tempBox.expandByPoint(tempSegment.start);
        tempBox.expandByPoint(tempSegment.end);

        tempBox.min.addScalar(radius);
        tempBox.max.addScalar(radius);
      }
      colliders.push(collider);
      // BVH-boundsTreeとの衝突判定
      // TODO: Remove Deadbox
      // if ( sphereCollider.center.y < - 80 ) {}

      let collided = false;
      boundsTree.current.shapecast({
        intersectsBounds: (box) => {
          if (om.phyType === "box") {
            return box.intersectsBox(tempBox);
          } else if (om.phyType === "sphere") {
            return box.intersectsSphere(tempSphere);
          } else if (om.phyType === "capsule") {
            return box.intersectsBox(tempBox);
          }
          return false;
        },
        intersectsTriangle: (tri) => {
          if (om.phyType === "sphere") {
            // get delta between closest point and center
            tri.closestPointToPoint(tempSphere.center, deltaVec);
            deltaVec.sub(tempSphere.center);
            const distance = deltaVec.length();
            if (distance < tempSphere.radius) {
              // move the sphere position to be outside the triangle
              const radius = tempSphere.radius;
              const depth = distance - radius;
              deltaVec.multiplyScalar(1 / distance);
              tempSphere.center.addScaledVector(deltaVec, depth);

              collided = true;
            }
          } else if (om.phyType === "capsule") {
            const triPoint = tempVector;
            const capsulePoint = tempVector2;
            const distance = tri.closestPointToSegment(
              tempSegment,
              triPoint,
              capsulePoint
            );
            if (distance < radius) {
              const depth = radius - distance;
              const direction = capsulePoint.sub(triPoint).normalize();
              tempSegment.start.addScaledVector(direction, depth);
              tempSegment.end.addScaledVector(direction, depth);

              collided = true;
            }
          } else if (om.phyType === "box") {
            const triPoint = tempVector;
            const capsulePoint = tempVector2;
            const distance = tri.closestPointToSegment(
              tempSegment,
              triPoint,
              capsulePoint
            );
            if (distance < radius) {
              const depth = radius - distance;
              const direction = capsulePoint.sub(triPoint).normalize();
              tempSegment.start.addScaledVector(direction, depth);
              tempSegment.end.addScaledVector(direction, depth);

              collided = true;
            }
          }
        },
        boundsTraverseOrder: (box) => {
          if (om.phyType === "box") {
            return box.distanceToPoint(tempBox.min);
          } else if (om.phyType === "capsule") {
            return box.distanceToPoint(tempCapsule.start);
          }
          // Default Sphere
          return box.distanceToPoint(tempSphere.center);
        },
      });

      // 衝突処理
      if (collided) {
        if (om.phyType === "box") {
          // TODO: sphereの関数を参考にして
        } else if (om.phyType === "sphere") {
          // get the delta direction and reflect the velocity across it
          deltaVec
            .subVectors(tempSphere.center, (collider as Sphere).center)
            .normalize();
          om.args.velocity.reflect(deltaVec);

          // dampen the velocity and apply some drag
          const dot = om.args.velocity.dot(deltaVec);
          om.args.velocity.addScaledVector(deltaVec, -dot * 0.5);
          om.args.velocity.multiplyScalar(Math.max(1.0 - deltaTime, 0));

          // update the sphere collider position
          (collider as Sphere).center.copy(tempSphere.center);

          // find the point on the surface that was hit
          tempVec
            .copy(tempSphere.center)
            .addScaledVector(deltaVec, -tempSphere.radius);

          // TODO: 衝突処理
          // onCollide( sphere, null, tempVec, deltaVec, dot, 0.05 );
        } else if (om.phyType === "capsule") {
          // TODO: sphereの関数を参考にして衝突関数前の処理を書く
        }
      }
    }
    // Handle collisions
    for (const object of moveGrp.current.children) {
      // TODO: ここで、衝突に対する移動値を計算する
    }
  };

  return (
    <NinjaEngineContext.Provider
      value={{
        init,
        device,
        isVertical,
        status,
        isPhysics: config.physics,
        player,
        playerInfo,
        playerIsOnGround,
        curMessage,
        npcChatHistory,
        isSound,
        setIsSound,
        bvhGrp,
        bvhCollider,
        moveGrp,
        shareGrp,
        boundsTree,
        updateCollisions,
        config,
        apiEndpoint,
        oms,
        sms,
        ums,
        tms,
        getOMById,
        getOMByName,
        getSMById,
        setArg,
        addOM,
        onOMIdChanged,
        offOMIdChanged,
        onOMsChanged,
        offOMsChanged,
      }}
    >
      <div
        id="Ninjaviewer"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          userSelect: "none",
        }}
      >
        <InputControlProvider>
          <MemoWebRTCProvider
            enable={init}
            token={token}
            roomName={config.projectName}
          >
            <NinjaWorkerProvider ThreeJSVer={ThreeJSVer}>
              <NinjaKVSProvider>
                {
                  /** スプラッシュスクリーン */ isSplashScreen && (
                    <MemoSplashScreen />
                  )
                }
                {init && njcFile && (
                  <>
                    {/** Canvasレンダリング */}
                    {!noCanvas ? (
                      <NCanvas
                        style={{
                          width: "100%",
                          height: "100%",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          zIndex: 1,
                          background: "#d2d2d2",
                        }}
                      >
                        <React.Suspense
                          fallback={
                            <Loading3D isLighting position={[0, 0, 3]} />
                          }
                        >
                          <NinjaCanvasItems />
                          {children}
                        </React.Suspense>
                      </NCanvas>
                    ) : (
                      <>{children}</>
                    )}
                    {/** UIレンダリング */}
                    <div
                      id="domContainer"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 2,
                        overflow: "hidden",
                        pointerEvents: "none",
                      }}
                    >
                      <UIItems />
                      {config.isDebug && <DebugComponent />}
                    </div>
                  </>
                )}
                {!init && !noCanvas && <Loading2D />}
              </NinjaKVSProvider>
            </NinjaWorkerProvider>
          </MemoWebRTCProvider>
        </InputControlProvider>
      </div>
    </NinjaEngineContext.Provider>
  );
};
// NinjaGLはnjc/njcPathどちらかでMemo化する
export const NinjaGL = React.memo(_NinjaGL, (prev, next) => {
  if (prev.njc && next.njc) {
    return prev.njc === next.njc;
  }
  if (prev.njcPath && next.njcPath) {
    return prev.njcPath === next.njcPath;
  }
  return false;
});

type NinjaCanvasProp = {
  children?: React.ReactNode;
};
export const NinjaCanvas = ({ children }: NinjaCanvasProp) => (
  <NCanvas>{children}</NCanvas>
);
export const NinjaCanvasItems = () => {
  return (
    <>
      {/** OMのID */}
      <OMObjects />
      <StaticObjects />
      {/** AINPC */}
      <AiNPCs />
      {/** Audio */}
      <OMAudios />
      {/** エフェクト */}
      <OMEffects />
      {/** 環境 */}
      <OMEnvirments />
      {/* * Water */}
      <OMWaters />
      {/** カメラ */}
      <Cameras />
      {/** MultiPlayer */}
      <MultiPlayer />
      {/** ColliderField & Player */}
      <ColliderField />
      {/** Moveable */}
      <Moveable />
      <Suspense fallback={<Loading3D position={[0, 0, 3]} />}>
        <group renderOrder={1}>
          {/** NonCollider */}
          <NonColliderTunnel.Out />
          <SystemFrame />
        </group>
      </Suspense>
    </>
  );
};

/**
 * システムフレーム(時間をすすめる)
 */
const SystemFrame = () => {
  const { init, status, sms, config } = useNinjaEngine();
  const { input } = useMultiInputControl();
  const { runFrameLoop, runInitialize, loadUserScript } = useNinjaWorker();

  useEffect(() => {
    const startScript = async () => {
      // 1. ユーザースクリプトの読み込み
      await loadUserScript(sms);
      // 2. ユーザースクリプトの初期化
      sms.forEach((sm) => {
        runInitialize(sm.id);
      });
    };
    startScript();
  }, [init, sms]);

  // フレームの更新
  useNFrame((state, delta) => {
    if (status.current === ENinjaStatus.Pause) {
      return;
    }

    // 3. ユーザースクリプトの更新
    sms.forEach((sm) => {
      runFrameLoop(sm.id, state, delta, input);
    });
  });

  return (
    <>
      {config.isDebug && (
        <Perf
          position="bottom-left"
          style={{ position: "absolute" }}
          minimal={true}
        />
      )}
    </>
  );
};
