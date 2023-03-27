import { Environment, GizmoHelper, GizmoViewport, Html, OrbitControls, PivotControls, Sky } from "@react-three/drei";
import { AnimationMixer, Box3, Euler, LineBasicMaterial, LineSegments, Matrix4, Mesh, Object3D, Quaternion, Raycaster, Vector2, Vector3, WireframeGeometry } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect, useContext, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { NinjaEditorContext } from "../NinjaEditorManager";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { MyLight, MyLights } from "./MainViewItems/Lights";
import { StaticObjects } from "./MainViewItems/Objects";
import { Terrain } from "./MainViewItems/Terrain";
import { generateUUID } from "three/src/math/MathUtils";
import { Avatar } from "./MainViewItems/Avatar";
import { MySky } from "./MainViewItems/Sky";
import { MdVideogameAsset, MdVideogameAssetOff } from "react-icons/md";
import { MdOutlineGridOff, MdOutlineGridOn } from "react-icons/md";
import { ThreeObjects } from "./MainViewItems/Three";
import { Perf } from "r3f-perf";
import { useInputControl } from "@/core/Core/InputControls";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { UICanvas } from "./MainViewUIs/UICanvas";

export const MainViewer = () => {
  const camRef = useRef<OrbitControlsImpl>();
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
    const loader = new GLTFLoader();
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
                  id: generateUUID(),
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
                  id: generateUUID(),
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
                id: generateUUID(),
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

  useEffect(() => {
    editor.setCamera(camRef.current);
    return () => {
      editor.camera = null;
    }
  }, [])

  return (
    <div style={{ height: "100%", position: "relative", background: "#333" }}>
      <Canvas
        style={{ background: "black", display: showCanvas? "block": "none" }}
        id="mainviewcanvas"
        camera={{ position: [-3, 3, -6] }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        shadows
      >
        <OrbitControls ref={camRef} makeDefault/>
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
      <div style={{ display: showUI? "block": "none", background: "rgba(255, 255, 255, 0.5)", position: "absolute", zIndex: 99, width: "100%", height: "100%", top: 0 }}>
        <UICanvas/>
      </div>
      <div style={{ position: "absolute", zIndex: 999, top: "10px", left: "10px" }}>
        <a 
          onClick={() => setIsGrid(!isGrid)}
          style={{ color: "#fff", cursor: "pointer", padding: "4px 6px", marginRight: "5px", background: "#222", borderRadius: "3px" }}
        >
          {isGrid? <MdOutlineGridOn/>: <MdOutlineGridOff/>}
        </a>
        <a 
          onClick={() => setShowCanvas(!showCanvas)}
          style={{ color: "#fff", cursor: "pointer", padding: "4px 6px", marginRight: "5px", background: "#222", borderRadius: "3px" }}
        >
          {showCanvas? <AiFillEye/>: <AiFillEyeInvisible/>}
        </a>
        <a 
          onClick={() => setShowUI(!showUI)}
          style={{ color: "#fff", cursor: "pointer", padding: "4px 6px", background: "#222", borderRadius: "3px" }}
        >
          {showUI? <MdVideogameAsset/>: <MdVideogameAssetOff/>}
        </a>
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
 * 補助操作
 */
const SystemControl = () => {
  const { camera } = useThree();
  const editor = useContext(NinjaEditorContext);
  const input = useInputControl("desktop");
  useFrame((_, delta) => {
    if (input.dash && (input.forward || input.backward || input.right || input.left)){
      if (editor.getCamera()){
        editor.getCamera().enabled = false;
      }
      const st = .5;
      var cameraDirection = new Vector3();
      camera.getWorldDirection(cameraDirection);
      var cameraPosition = camera.position.clone();
      var cameraTarget: Vector3;
      if (input.forward) {
        cameraPosition.add(cameraDirection.clone().multiplyScalar(st));
        camera.position.copy(cameraPosition);
      }
      if (input.backward) {
        cameraPosition.sub(cameraDirection.clone().multiplyScalar(st));
        camera.position.copy(cameraPosition);
      }
      if (input.right) {
        var cameraRight = new Vector3();
        cameraRight.crossVectors(cameraDirection, camera.up).normalize();
        cameraPosition.add(cameraRight.multiplyScalar(st));
        camera.position.copy(cameraPosition);
        cameraTarget = cameraPosition.clone().add(cameraDirection);
        camera.lookAt(cameraTarget);
      }
      else if (input.left) {
        var cameraLeft = new Vector3();
        cameraLeft.crossVectors(cameraDirection, camera.up).normalize();
        cameraPosition.sub(cameraLeft.multiplyScalar(st));
        camera.position.copy(cameraPosition);
        cameraTarget = cameraPosition.clone().add(cameraDirection);
        camera.lookAt(cameraTarget);
      }
    }
  });
  return (
    <>
    </>
  )
}