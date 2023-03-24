import { Environment, GizmoHelper, GizmoViewport, Html, OrbitControls, PivotControls, Sky } from "@react-three/drei";
import { AnimationMixer, Box3, Euler, LineBasicMaterial, LineSegments, Matrix4, Mesh, Object3D, Quaternion, Raycaster, Vector2, Vector3, WireframeGeometry } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect, useContext, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { NinjaEditorContext } from "../NinjaEditorManager";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { MyLight, MyLights } from "./MainViewItems/Lights";
import { StaticObjects } from "./MainViewItems/StaticObjects";
import { Terrain } from "./MainViewItems/Terrain";
import { generateUUID } from "three/src/math/MathUtils";
import { Avatar } from "./MainViewItems/Avatar";
import { MySky } from "./MainViewItems/Sky";
import { BsGrid3X3 } from "react-icons/bs";
import { MdOutlineGridOff, MdOutlineGridOn } from "react-icons/md";
import { ThreeObjects } from "./MainViewItems/Three";

export const MainViewer = () => {
  const camRef = useRef<OrbitControlsImpl>();
  const editor = useContext(NinjaEditorContext);
  const [isGrid, setIsGrid] = useState<boolean>(true);

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
      //     visiableType: "auto",
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
            scene.traverse((node: Mesh) => {
              if ((node as Mesh).isMesh) {
                if (node.geometry) {
                  node.castShadow = true;
                  node.receiveShadow = true;
                }
              }
            });
            if (type == "gltf") {
              // Animationがあればセットする
              editor.setObjectManagement({
                id: generateUUID(),
                filePath: filePath,
                type: "object",
                physics: "aabb",
                visiableType: "auto",
                args: {
                  position: new Vector3(0, 0, 0),
                  rotation: new Euler(0, 0, 0)
                },
                object: scene,
                animations: gltf.animations,
                mixer: gltf.animations.length > 0? new AnimationMixer(scene): null
              });
            }
            if (type == "ter") {
              editor.setObjectManagement({
                id: generateUUID(),
                filePath: filePath,
                type: "terrain",
                physics: "along",
                visiableType: "force",
                args: {},
                object: scene
              });
            }
            if (type == "avt") {
              editor.setObjectManagement({
                id: generateUUID(),
                filePath: filePath,
                type: "avatar",
                physics: "aabb",
                visiableType: "force",
                args: {
                  height: 1.7,
                  isCenter: true,
                  animMapper: {
                    idle: "Idle",
                    run : "Run",
                    walk: "Walk",
                    jump : "Jump",
                    action : "Kick"
                  },
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
  }, [])

  return (
    <div style={{ height: "100%", position: "relative" }}>
      <Canvas
        style={{ background: "black" }}
        id="mainviewcanvas"
        camera={{ position: [-3, 3, -6] }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <OrbitControls makeDefault={true} ref={camRef} />
        <MyLights/>
        <StaticObjects/>
        <Terrain/>
        <Avatar/>
        <MySky/>
        <ThreeObjects/>
        {isGrid &&
          <SystemHelper/>
        }
      </Canvas>
      <div style={{ position: "absolute", zIndex: "999", top: "10px", left: "10px" }}>
        <a 
          onClick={() => setIsGrid(!isGrid)}
          style={{ color: "#fff", cursor: "pointer", padding: "4px 6px", background: "#222", borderRadius: "3px" }}
        >
          {isGrid? <MdOutlineGridOn/>: <MdOutlineGridOff/>}
        </a>
      </div>
    </div>
  )
}

const SystemHelper = () => {
  return (
    <>
      <gridHelper args={[4096, 4096]} />
      <GizmoHelper alignment="top-right" margin={[75, 75]}>
          <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
    </>
  )
}

const SystemUI = () => {
  
  return (
    <>
      <div style={{ position: "absolute", zIndex: "999", top: "10px", left: "10px" }}>
        <a style={{ color: "#fff", cursor: "pointer", padding: "4px 6px", background: "#222", borderRadius: "3px" }}>
          <BsGrid3X3/>
        </a>
      </div>
    </>
  )
}