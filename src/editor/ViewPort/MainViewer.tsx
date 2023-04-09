import { GizmoHelper, GizmoViewport, OrbitControls, PerspectiveCamera as DPerspectiveCamera } from "@react-three/drei";
import { AnimationMixer, Box3, Euler, LineBasicMaterial, LineSegments, Matrix4, Mesh, Object3D, Quaternion, Raycaster, Vector2, Vector3, WireframeGeometry, MathUtils, PerspectiveCamera } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect, useContext, useRef, useLayoutEffect } from "react";
import { DRACOLoader, GLTFLoader, KTX2Loader, OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { NinjaEditorContext } from "../NinjaEditorManager";
import { MyLight, MyLights } from "./MainViewItems/Lights";
import { StaticObjects } from "./MainViewItems/Objects";
import { Terrain } from "./MainViewItems/Terrain";
import { Avatar } from "./MainViewItems/Avatar";
import { MySky } from "./MainViewItems/Sky";
import { MdVideogameAsset, MdVideogameAssetOff } from "react-icons/md";
import { MdOutlineGridOff, MdOutlineGridOn } from "react-icons/md";
import { ThreeObjects } from "./MainViewItems/Three";
import { Perf } from "r3f-perf";
import { useInputControl } from "@/core/utils/InputControls";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { UICanvas } from "./MainViewUIs/UICanvas";
import styles from "@/App.module.scss";
import { MeshoptDecoder } from "meshoptimizer";

export const MainViewer = () => {
  const [gridNum, setGridNum] = useState<8|16|24|32>(8);
  const editor = useContext(NinjaEditorContext);
  const [isGrid, setIsGrid] = useState<boolean>(true);
  const [showCanvas, setShowCanvas] = useState<boolean>(true);
  const [showUI, setShowUI] = useState<boolean>(false);

  /**
   * シーンへの直接ドラッグ＆ドロップ時
   * @param e 
   */
  const handleDrop = (e) => {
    e.preventDefault();
    const DRACO_LOADER = new DRACOLoader();
    const KTX2_LOADER = new KTX2Loader();
    const loader = new GLTFLoader()
          .setCrossOrigin('anonymous')
          .setDRACOLoader( DRACO_LOADER )
          .setKTX2Loader( KTX2_LOADER.detectSupport( editor.render ) )
          .setMeshoptDecoder( MeshoptDecoder );
    if (!editor.contentsSelect) {
      /**
       * ここは、一度アセットに落として、表示する必要がある
       */
      // const file = e.dataTransfer.files[0];
      // loader.load(URL.createObjectURL(file), (gltf) => {
      //   editor.setObjectManagement({
      //     id: generateUUID(),
      //     type: "object",
      //     visibleType: "auto",
      //     args: null,
      //     physics: "aabb",
      //     object: gltf.scene
      //   });
      // });
    }
    else {
      const type = editor.contentsSelectType;
      if (
        type == "gltf" ||
        type == "ter" ||
        type == "avt"
      ) {
        const filePath = editor.contentsSelectPath;
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
                editor.setObjectManagement({
                  id: MathUtils.generateUUID(),
                  filePath: filePath,
                  type: "avatar",
                  physics: "aabb",
                  visibleType: "force",
                  args: {
                    height: 1.7,
                    isCenter: true,
                    animMapper: userData.animMapper? userData.animMapper: null,
                    sounds: [
                      {
                        key: "grassWalk",
                        filePath: "mp3/grassWalk.mp3",
                        volume: 0.5,
                        loop: true,
                        trigAnim: "walk",
                        stopAnim: "walk"
                      },
                      {
                        key: "grassRun",
                        filePath: "mp3/grassRun.mp3",
                        volume: 0.5,
                        loop: true,
                        trigAnim: "run",
                        stopAnim: "run"
                      }
                    ]
                  },
                  object: scene,
                  animations: gltf.animations,
                  mixer: gltf.animations.length > 0? new AnimationMixer(scene): null
                });
              }
              else {
                // Animationがあればセットする
                editor.setObjectManagement({
                  id: MathUtils.generateUUID(),
                  filePath: filePath,
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
              editor.setObjectManagement({
                id: MathUtils.generateUUID(),
                filePath: filePath,
                type: "terrain",
                physics: "along",
                visibleType: "force",
                args: {},
                object: scene
              });
            }
          },
          (xhr) => { },
          async (err) => {
            console.log("モデル読み込みエラ―");
            console.log(err);
          },
          
        )
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
        camera={{ position: [-3, 3, -6] }}
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
        {isGrid &&
          <SystemHelper/>
        }
        <SystemControl />
      </Canvas>
      <div className={styles.uiCanvas} style={{ display: showUI? "block": "none" }}>
        <UICanvas gridNum={gridNum}/>
      </div>
      <div className={styles.control}>
        <a 
          onClick={() => setIsGrid(!isGrid)}
          className={styles.helperBtn}
        >
          {isGrid? <MdOutlineGridOn/>: <MdOutlineGridOff/>}
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
              if (gridNum == 8) {
                setGridNum(16);
              }
              else if (gridNum == 16) {
                setGridNum(24);
              }
              else if (gridNum == 24) {
                setGridNum(32);
              }
              else if (gridNum == 32) {
                setGridNum(8);
              }
            }}
            className={styles.gridNum}
          >
            {gridNum}
          </a>
          </>
        }
      </div>
    </div>
  )
}

/**
 * 補助機能
 */
const SystemHelper = () => {
  return (
    <>
      <gridHelper args={[4096, 4096]} />
      <GizmoHelper alignment="top-right" margin={[75, 75]}>
          <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
      <Perf position={"bottom-right"} style={{ position: "absolute" }} minimal={true}/>
    </>
  )
}

/**
 * WASDカメラ視点移動
 * 補助操作
 */
const SystemControl = () => {
  const ref = useRef<OrbitControlsImpl>(null);
  const cameraRef = useRef<PerspectiveCamera>(null);
  const { gl, camera } = useThree();
  const editor = useContext(NinjaEditorContext);
  editor.render = gl;
  const input = useInputControl("desktop");

  useLayoutEffect(() => {
    if (cameraRef && cameraRef.current) {
      cameraRef.current.position.set(-5, 3, 5);
    }
  }, []);

  useEffect(() => {
    if (cameraRef && cameraRef.current) {
      cameraRef.current.far = camera.far;
    }
  }, [camera]);

  useFrame((_, delta) => {
    if (input.dash && (input.forward || input.backward || input.right || input.left)) {
      const st = 0.5;
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

    } else {
      if (ref.current && cameraRef.current) {
        cameraRef.current.position.copy(ref.current.object.position);
        cameraRef.current.rotation.copy(ref.current.object.rotation);
        cameraRef.current.lookAt(ref.current.target);
      }
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





