import { Environment, OrbitControls, PivotControls, Sky } from "@react-three/drei";
import { Box3, Euler, LineBasicMaterial, LineSegments, Matrix4, Mesh, Object3D, Quaternion, Raycaster, Vector2, Vector3, WireframeGeometry } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect, useContext, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { NaniwaEditorContext } from "../NaniwaEditorManager";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { MyLight, MyLights } from "./MainViewItems/Lights";
import { StaticObjects } from "./MainViewItems/StaticObjects";
import { Terrain } from "./MainViewItems/Terrain";
import { generateUUID } from "three/src/math/MathUtils";
import { Avatar } from "./MainViewItems/Avatar";
import { MySky } from "./MainViewItems/Sky";

export const MainViewer = () => {
  const camRef = useRef<OrbitControlsImpl>();
  const editor = useContext(NaniwaEditorContext);

  /**
   * シーンへの直接ドラッグ＆ドロップ時
   * @param e 
   */
  const handleDrop = (e) => {
    e.preventDefault();
    const loader = new GLTFLoader();
    if (!editor.contentsSelect) {
      const file = e.dataTransfer.files[0];
      loader.load(URL.createObjectURL(file), (gltf) => {
        editor.setObjectManagement({
          id: generateUUID(),
          type: "object",
          visiableType: "auto",
          args: null,
          physics: "aabb",
          object: gltf.scene
        });
      });
    }
    else {
      const type = editor.contentsSelectType;
      if (
        type == "gltf" ||
        type == "ter" ||
        type == "avt"
      ) {
        loader.load(
          editor.contentsSelectPath,
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
              editor.setObjectManagement({
                id: generateUUID(),
                filePath: editor.contentsSelectPath,
                type: "object",
                physics: "aabb",
                visiableType: "auto",
                args: {
                  position: new Vector3(0, 0, 0),
                  rotation: new Euler(0, 0, 0)
                },
                object: scene
              });
            }
            if (type == "ter") {
              editor.setObjectManagement({
                id: generateUUID(),
                filePath: editor.contentsSelectPath,
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
                filePath: editor.contentsSelectPath,
                type: "avatar",
                physics: "aabb",
                visiableType: "force",
                args: {
                  height: 1.7,
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
                object: scene
              });
            }
          },
          (xhr) => { },
          async (err) => {
            console.log("モデル読み込みエラ―");
            console.log(err);
          }
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
    <div style={{ height: "100%" }}>
      <Canvas
        style={{ background: "black" }}
        id="mainviewcanvas"
        camera={{ position: [-3, 3, -6] }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <OrbitControls makeDefault={true} ref={camRef} />
        <gridHelper args={[4096, 4096]} />
        <MyLights/>
        <StaticObjects/>
        <Terrain/>
        <Avatar/>
        <MySky/>
      </Canvas>

    </div>
  )
}