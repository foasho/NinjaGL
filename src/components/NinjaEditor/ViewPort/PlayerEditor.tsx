import { reqApi } from "@/services/ServciceApi";
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimationClip, AnimationMixer, Euler, Mesh, Object3D, Raycaster, Vector2, Vector3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer, Selection, Select, Outline } from "@react-three/postprocessing";
import { NinjaEditorContext } from "../NinjaEditorManager";
import { generateUUID } from "three/src/math/MathUtils";
import { MdOutlineSystemUpdate } from "react-icons/md";
import { useTranslation } from "react-i18next";

export const PlayerEditor = () => {
  const editor = useContext(NinjaEditorContext);
  const playerManager = editor.playerManager;
  const ref = useRef();
  const [type, setType] = useState<"avatar" | "other" | "npc">("avatar");
  const [height, setHeight] = useState<number>(1.7);
  const [selectAnim, setSelectAnim] = useState<string>();
  const [scene, setScene] = useState<Object3D>(null)
  const [mixer, setMixer] = useState<AnimationMixer>();
  const [animations, setAnimations] = useState<AnimationClip[]>([]);
  const { t } = useTranslation();
  const handleDrop = (e) => {
    e.preventDefault();
    const loader = new GLTFLoader();
    if (!editor.contentsSelect) {
      const file = e.dataTransfer.files[0];
      loader.load(URL.createObjectURL(file), (gltf) => {
        setScene(gltf.scene);
        const _mixer = new AnimationMixer(gltf.scene);
        setMixer(_mixer);
        setAnimations(gltf.animations);
        editor.setPlayerManager({
          ...playerManager,
          object: scene,
          animations: gltf.animations
        });
      });
    }
    else {
      const type = editor.contentsSelectType;
      if (
        type == "gltf"
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
              setScene(scene);
              const _mixer = new AnimationMixer(scene);
              setMixer(_mixer);
              setAnimations(gltf.animations);
              editor.setPlayerManager({
                ...playerManager,
                object: scene,
                animations: gltf.animations
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
    if (animations.length > 0) {
      const selectAnimName = editor.getSelectPlayerAnimation();
      if (selectAnimName){
        setSelectAnim(selectAnimName);
      }
      else {
        setSelectAnim(animations[0].name);
      }
    }
  }, [scene, selectAnim]);

  const playAnimation = (name: string) => {
    const target = animations.find(a => a.name == name);
    if (target){
      const curAction = mixer.clipAction(target);
      curAction.enabled = true;
      curAction.play();
    }
  }

  const stopAnimation = (name: string) => {
    const target = animations.find(a => a.name == name);
    if (target){
      const curAction = mixer.clipAction(target);
      curAction.enabled = false;
      curAction.stop();
    }
  }

  const changeSelectAnim = (name: string) => {
      stopAnimation(selectAnim);
      setSelectAnim(name);
  }

  if (selectAnim){
    playAnimation(selectAnim);
  }

  return (
    <>
      <div onDrop={handleDrop} onDragOver={handleDragOver} style={{ height: "100%" }}>
        {scene ?
          <Canvas camera={{ position: [0, 1.5, 3.5] }} ref={ref}>
            <Environment preset="dawn" blur={0.7} background />
            <OrbitControls />
            <gridHelper args={[4096, 4096]} />
            <primitive object={scene} />
            <PlayerEditorUpdate 
              selectAnim={selectAnim} 
              animations={animations} 
              mixer={mixer} 
              onCallback={changeSelectAnim}
            />
          </Canvas>
          :
          <>
            <div style={{ background: "#121212", height: "100%", position: "relative" }}>
              <div style={{ color: "#fff", fontWeight: "bold", position: "absolute", width: "100%", textAlign: "center", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                {t("uploadGLTF")}
              </div>
            </div>
          </>
        }
      </div>
    </>
  )
}

interface IPlayerEditorUpdate {
  mixer: AnimationMixer;
  animations: AnimationClip[];
  selectAnim: string;
  onCallback: (animName: string) => void;
}
const PlayerEditorUpdate = (props: IPlayerEditorUpdate) => {
  const editor = useContext(NinjaEditorContext);
  useFrame((_, delta) => {
    if (props.mixer && props.animations.length > 0){
      props.mixer.update(delta);
    }
    if (editor.getSelectPlayerAnimation() !== props.selectAnim){
      props.onCallback(editor.getSelectPlayerAnimation());
    }
  })

  return <></>
}