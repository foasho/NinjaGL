import { GizmoHelper, GizmoViewport, OrbitControls, PerspectiveCamera as DPerspectiveCamera, Text } from "@react-three/drei";
import { AnimationMixer, Box3, Euler, LineBasicMaterial, LineSegments, Matrix4, Mesh, Object3D, Quaternion, Raycaster, Vector2, Vector3, WireframeGeometry, MathUtils, PerspectiveCamera, Color } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect, useContext, useRef, useLayoutEffect } from "react";
import { DRACOLoader, GLTFLoader, KTX2Loader, OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { HomeCameraPosition, NinjaEditorContext } from "../NinjaEditorManager";
import { MyLight, MyLights } from "./MainViewItems/Lights";
import { StaticObjects } from "./MainViewItems/Objects";
import { Terrain } from "./MainViewItems/Terrain";
import { Avatar } from "./MainViewItems/Avatar";
import { MySky } from "./MainViewItems/Sky";
import { MdVideogameAsset, MdVideogameAssetOff } from "react-icons/md";
import { MdOutlineGridOff, MdOutlineGridOn } from "react-icons/md";
import { ThreeObjects } from "./MainViewItems/Three";
import { Perf } from "r3f-perf";
import { useInputControl } from "ninja-core";
import { AiFillEye, AiFillEyeInvisible, AiFillSetting } from "react-icons/ai";
import { UICanvas } from "./MainViewUIs/UICanvas";
import styles from "@/App.module.scss";
import { MeshoptDecoder } from "meshoptimizer";
import { isNumber } from "@/commons/functional";
import Swal from "sweetalert2";
import { Cameras } from "./MainViewItems/Cameras";
import { FogComponent } from "./MainViewItems/Fog";
import { useSnapshot } from "valtio";
import { globalContentStore, globalStore } from "../Store";
import { useSession } from "next-auth/react";
import { MyEnviroment } from "./MainViewItems/MyEnvironment";
import { DRACO_LOADER } from "../Hierarchy/ContentViewer";

export const MainViewer = () => {
  const loadingRef = useRef<HTMLDivElement>();
  const contentsState = useSnapshot(globalContentStore);
  const [isHovered, setIsHovered] = useState(false);
  const cameraSpeedRef = useRef<HTMLInputElement>();
  const [cameraSpeed, setCameraSpeed] = useState<number>(10);
  const cameraFarRef = useRef<HTMLInputElement>();
  const [cameraFar, setCameraFar] = useState<number>(1000);
  const worldSizeRef = useRef<HTMLInputElement>();
  const [worldSize, setWorldSize] = useState<number>(64);
  const worldGridSizeRef = useRef<HTMLInputElement>();
  const [worldGridSize, setWorldGridSize] = useState<number>(8);
  const [uiGridNum, setUIGridNum] = useState<8|16|24|32>(8);
  const editor = useContext(NinjaEditorContext);
  const [isGrid, setIsGrid] = useState<boolean>(true);
  const [isWorldHelper, setIsWorldHelper] = useState<boolean>(true);
  const [isGizmo, setIsGizmo] = useState<boolean>(true);
  const [showCanvas, setShowCanvas] = useState<boolean>(true);
  const [showUI, setShowUI] = useState<boolean>(false);
  const { data: session } = useSession();

  /**
   * Editorの設定に同期
   */

  /**
   * シーンへの直接ドラッグ＆ドロップ時
   * @param e 
   */
  const handleDrop = async (e) => {
    e.preventDefault();
    const loader = new GLTFLoader()
          .setCrossOrigin('anonymous')
          .setDRACOLoader( DRACO_LOADER )
          .setMeshoptDecoder( MeshoptDecoder );
    if (!contentsState.currentUrl) {
      /**
       * ここは、一度アセットに落として、表示する必要がある
       */
      if (session){
        // Upload
        Swal.fire({
          title: "Now Developing...",
          icon: "info",
          confirmButtonText: "OK",
        });
        return;
      }
      else {
        // ログインしてください
        Swal.fire({
          title: "ログインしてください",
          icon: "info",
          confirmButtonText: "OK",
        });
        return;
      }
    }
    else {
      const type = contentsState.currentType;
      if (
        type == "gltf" ||
        type == "ter" ||
        type == "avt"
      ) {
        if (loadingRef.current) {
          loadingRef.current.style.display = "block";
        }
        const filePath = contentsState.currentUrl;
        loader.load(
          filePath,
          async (gltf) => {
            const scene = gltf.scene || gltf.scenes[0] as Object3D;
            const userData: { [key: string]: any } = {};
            scene.traverse((node: Mesh) => {
              if (node.userData){
                Object.keys(node.userData).map((key) => {
                  userData[key] = node.userData[key];
                });
              }
              if ((node as Mesh).isMesh) {
                if (node.geometry) {
                  node.castShadow = true;
                  node.receiveShadow = true;
                }
              }
            });
            if (type == "gltf") {
              if (userData.type && userData.type == "avatar"){
                // すでにアバターがある場合には、削除する
                if (editor.getAvatar()){
                  editor.removeAvatar();
                }
                editor.setOM({
                  id: MathUtils.generateUUID(),
                  name: "*Avatar",
                  filePath: filePath,
                  type: "avatar",
                  physics: "aabb",
                  visibleType: "force",
                  args: {
                    height: 1.7,
                    isCenter: true,
                    animMapper: userData.animMapper? userData.animMapper: null,
                  },
                  object: scene,
                  animations: gltf.animations,
                  mixer: gltf.animations.length > 0? new AnimationMixer(scene): null
                });
              }
              else {
                // Animationがあればセットする
                editor.setOM({
                  id: MathUtils.generateUUID(),
                  filePath: filePath,
                  name: "*Object",
                  type: "object",
                  physics: "aabb",
                  visibleType: "auto",
                  args: {
                    position: new Vector3(0, 0, 0),
                    rotation: new Euler(0, 0, 0)
                  },
                  object: scene,
                  animations: gltf.animations,
                  mixer: gltf.animations.length > 0? new AnimationMixer(scene): null
                });
              }
            }
            if (type == "ter") {
              editor.setOM({
                id: MathUtils.generateUUID(),
                filePath: filePath,
                name: "*Terrain",
                type: "terrain",
                physics: "along",
                visibleType: "force",
                args: {},
                object: scene
              });
            }
            if (loadingRef.current) {
              loadingRef.current.style.display = "none";
            }
          },
          (xhr) => { },
          async (err) => {
            console.log("モデル読み込みエラ―");
            console.log(err);
            if (loadingRef.current) {
              loadingRef.current.style.display = "none";
            }
          },
          
        );
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault(); // ブラウザのデフォルト動作をキャンセルする
  };

  return (
    <div className={styles.mainView}>
      <Canvas
        style={{ display: showCanvas? "block": "none" }}
        id="mainviewcanvas"
        camera={{ position: HomeCameraPosition }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        shadows
      >
        <MyLights/>
        <StaticObjects/>
        <Terrain/>
        <Avatar/>
        <MySky/>
        <ThreeObjects/>
        <Cameras/>
        <FogComponent/>
        <MyEnviroment/>
        <SystemHelper isGizmo={isGizmo} cameraFar={cameraFar} cameraSpeed={cameraSpeed} worldSize={worldSize} isGrid={isGrid} isWorldHelper={isWorldHelper} worldGridSize={worldGridSize} />
      </Canvas>
      <div className={styles.uiCanvas} style={{ display: showUI? "block": "none" }}>
        <UICanvas gridNum={uiGridNum}/>
      </div>
      <div className={styles.control}>
        <a 
          className={styles.helperBtn}
          >
          <AiFillSetting
            onClick={() => setIsHovered(!isHovered)}
          />
          {isHovered && (
              <div 
                className={styles.tooltipContent}
              >
                <div className={styles.chechboxes}>
                  <label>
                    <input type="checkbox" checked={isGrid} onChange={() => setIsGrid(!isGrid)} />
                    水平グリッド線
                  </label>
                  <label>
                    <input type="checkbox" checked={isWorldHelper} onChange={() => setIsWorldHelper(!isWorldHelper)} />
                    ワールド補助線
                  </label>
                  <label>
                    <input type="checkbox" checked={isGizmo} onChange={() => setIsGizmo(!isGizmo)} />
                    Gizmo
                  </label>
                </div>
                <div className={styles.numberInputs}>
                  <label>
                    カメラスピード
                    <input 
                      type="text"
                      ref={cameraSpeedRef}
                      placeholder={cameraSpeed.toString()}
                      onKeyDown={(e: any) => {
                        if (e.key == "Enter" && cameraSpeedRef.current) {
                          if (isNumber(cameraSpeedRef.current.value)) {
                            const val = Number(cameraSpeedRef.current.value);
                            setCameraSpeed(val);
                          }
                        }
                      }}
                    />
                  </label>
                  <label>
                    視野(far)
                    <input 
                      type="text"
                      ref={cameraFarRef}
                      placeholder={cameraFar.toString()}
                      onKeyDown={(e: any) => {
                        if (e.key == "Enter" && cameraFarRef.current) {
                          if (isNumber(cameraFarRef.current.value)) {
                            const val = Number(cameraFarRef.current.value);
                            if (val <= 4096){
                              setCameraFar(val);
                            }
                            else {
                              Swal.fire({
                                title: "エラー",
                                text: "4096以下の値を入力してください",
                                icon: "error"
                              });
                            }
                          }
                        }
                      }}
                    />
                  </label>
                  <label>
                    ワールドの広さ
                    <input 
                      type="text"
                      ref={worldSizeRef}
                      placeholder={worldSize.toString()}
                      onKeyDown={(e: any) => {
                        if (e.key == "Enter" && worldSizeRef.current) {
                          if (isNumber(worldSizeRef.current.value)) {
                            const val = Number(worldSizeRef.current.value);
                            if (val <= 4096){
                              setWorldSize(val);
                            }
                            else {
                              Swal.fire({
                                title: "エラー",
                                text: "4096以下の値を入力してください",
                                icon: "error"
                              });
                            }
                          }
                        }
                      }}
                    />
                  </label>
                  <label>
                    グリッド数
                    <input 
                      type="text"
                      ref={worldGridSizeRef}
                      placeholder={worldGridSize.toString()}
                      onKeyDown={(e: any) => {
                        if (e.key == "Enter" && worldGridSizeRef.current) {
                          if (isNumber(worldGridSizeRef.current.value)) {
                            const val = Number(worldGridSizeRef.current.value);
                            setWorldGridSize(val);
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
          onClick={() => setShowCanvas(!showCanvas)}
          className={styles.showCanvas}
        >
          {showCanvas? <AiFillEye/>: <AiFillEyeInvisible/>}
        </a>
        <a 
          onClick={() => setShowUI(!showUI)}
          className={styles.showUI}
        >
          {showUI? <MdVideogameAsset/>: <MdVideogameAssetOff/>}
        </a>
        {showUI &&
          <>
            <a 
            onClick={() => {
              if (uiGridNum == 8) {
                setUIGridNum(16);
              }
              else if (uiGridNum == 16) {
                setUIGridNum(24);
              }
              else if (uiGridNum == 24) {
                setUIGridNum(32);
              }
              else if (uiGridNum == 32) {
                setUIGridNum(8);
              }
            }}
            className={styles.gridNum}
          >
            {uiGridNum}
          </a>
          </>
        }
      </div>
      <div ref={loadingRef} style={{ display: "none", background: "#12121266", height: "100%", width: "100%", top: 0, left: 0, position: "absolute", zIndex: 1000000 }}>
        <div style={{ color: "#fff", fontWeight: "bold", position: "absolute", width: "100%", textAlign: "center", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          Loading...
        </div>
      </div>
    </div>
  )
}

/**
 * 補助機能
 */
interface ISysytemHelper {
  worldGridSize: number;
  cameraFar : number;
  cameraSpeed: number;
  isGrid: boolean;
  isWorldHelper: boolean;
  worldSize: number;
  isGizmo: boolean;
}
const SystemHelper = (props: ISysytemHelper) => {
  const gridHelperSize = 4096;
  const divisions = props.worldGridSize;
  const cellSize = props.worldSize / divisions;
  const numberElements = [];
  const numberPlanes = [];

  const getCenterPosFromLayer = (
    layer: number, 
    yPos: number, 
    worldSize: number, 
    layerGrid:number
  ): Vector3  => {
    const layerXLen = worldSize / layerGrid;
    const layerZLen = worldSize / layerGrid;
    const cx = worldSize / 2;
    const cz = worldSize / 2;
    const c = Math.ceil(layer/layerGrid);
    let r = (layer) % (layerGrid);
    if (r === 0) r = layerGrid;
    const absPosX = (layerGrid - r) * layerXLen;
    const absPosZ = (c-1) * layerZLen;
    const worldXZ = [
      absPosX - cx + layerXLen / 2,
      - absPosZ + cz - layerZLen/2
    ];
    return new Vector3(worldXZ[0], yPos, worldXZ[1]);
  }

  if (props.isWorldHelper){
    for (let i = 0; i < divisions; i++) {
      for (let j = 0; j < divisions; j++) {
        const number = i * divisions + j + 1;
        const textPosition = getCenterPosFromLayer(number, -0.01, props.worldSize, divisions);
        const planePosition = new Vector3().addVectors(textPosition, new Vector3(0, -0.01, 0));
        const isEven = (i + j) % 2 === 0;
        const color1 = (isEven)? new Color(0x808080): new Color(0xd3d3d3);
        const color2 = (isEven)? new Color(0xd3d3d3): new Color(0x808080);
        numberElements.push(
          <Text
            key={number}
            fontSize={cellSize * 0.25}
            position={textPosition}
            rotation={[Math.PI/2, Math.PI, 0]}
            color={color1}
          >
            {number}
          </Text>
        );
        numberPlanes.push(
          <mesh
            key={number}
            position={planePosition}
            rotation={[-Math.PI/2, 0, 0]}
          >
            <planeBufferGeometry args={[cellSize, cellSize]} />
            <meshBasicMaterial 
              color={color2}
              transparent={true}
              opacity={0.3}
            />
          </mesh>
        );
      }
    }
  }

  return (
    <>
      <CameraControl cameraSpeed={props.cameraSpeed} cameraFar={props.cameraFar} />
      {props.isGrid &&
        <gridHelper args={[gridHelperSize, gridHelperSize]} />
      }
      {props.isGizmo &&
      <GizmoHelper alignment="top-right" margin={[75, 75]}>
          <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
      }
      <Perf position={"bottom-right"} style={{ position: "absolute" }} minimal={true}/>
      <>
      {numberElements}
      {numberPlanes}
      </>
    </>
  )
}

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
  const editor = useContext(NinjaEditorContext);
  const ref = useRef<OrbitControlsImpl>(null);
  const cameraRef = useRef<PerspectiveCamera>(null);
  const { gl, camera } = useThree();
  const input = useInputControl("desktop");
   // Fキーが押された瞬間にカメラをフォーカスするためのフラグ
   const [focusOnObject, setFocusOnObject] = useState(false);

  useLayoutEffect(() => {
    if (cameraRef && cameraRef.current) {
      const initCameraPosition = new Vector3(-3, 5, -10);
      cameraRef.current.position.copy(initCameraPosition.clone());
      cameraRef.current.lookAt(0, 0, 0);
      camera.position.copy(initCameraPosition.clone());
      camera.lookAt(0, 0, 0);
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
  const targetFocusCamera = (id: string) => {
    const position = editor.getPosition(id);
    if (position) {
      const target = new Vector3().copy(position.clone());
  
      // ターゲットからカメラまでの距離を設定
      const distance = 5;
  
      // ターゲットの前方向ベクトルをカメラの現在の位置から計算
      const forwardDirection = new Vector3().subVectors(target, cameraRef.current.position).normalize();
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
  
      cameraRef.current.position.copy(focusPosition);
      cameraRef.current.lookAt(target);
      if (ref && ref.current) {
        ref.current.target.copy(target);
      }
    }
  };

  useFrame((_, delta) => {
    // Fキーが押された瞬間の検出
    if (input.pressedKeys.includes("KeyF") && !focusOnObject) {
      setFocusOnObject(true);
    } else if (!input.pressedKeys.includes("KeyF") && focusOnObject) {
      setFocusOnObject(false);
    }

    // Fキーが押された瞬間にstate.currentIdにフォーカスする
    if (focusOnObject && state.currentId) {
      targetFocusCamera(state.currentId);
    }
    if (input.dash && (input.forward || input.backward || input.right || input.left)) {
      const st = props.cameraSpeed * delta;
      const cameraDirection = new Vector3();
      cameraRef.current.getWorldDirection(cameraDirection);
      const cameraPosition = cameraRef.current.position.clone();

      if (input.forward) {
        cameraPosition.add(cameraDirection.clone().multiplyScalar(st));
      }
      if (input.backward) {
        cameraPosition.sub(cameraDirection.clone().multiplyScalar(st));
      }
      if (input.right) {
        const cameraRight = new Vector3();
        cameraRight.crossVectors(cameraDirection, cameraRef.current.up).normalize();
        cameraPosition.add(cameraRight.multiplyScalar(st));
      }
      if (input.left) {
        const cameraLeft = new Vector3();
        cameraLeft.crossVectors(cameraDirection, cameraRef.current.up).normalize();
        cameraPosition.sub(cameraLeft.multiplyScalar(st));
      }

      cameraRef.current.position.copy(cameraPosition);
      ref.current.target.copy(cameraPosition.add(cameraDirection));

    }
    else if (ref.current && cameraRef.current) {
      cameraRef.current.position.copy(ref.current.object.position);
      cameraRef.current.rotation.copy(ref.current.object.rotation);
      cameraRef.current.lookAt(ref.current.target);
    }
  });

  return (
    <>
      <DPerspectiveCamera makeDefault ref={cameraRef} />
      <OrbitControls
        ref={ref}
        args={[cameraRef.current, gl.domElement]}
        camera={cameraRef.current}
        makeDefault={true}
      />
    </>
  );
};





