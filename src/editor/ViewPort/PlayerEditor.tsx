import { reqApi } from "@/services/ServciceApi";
import { Environment, OrbitControls, useHelper } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { DragEventHandler, MutableRefObject, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimationClip, AnimationMixer, Euler, Mesh, Object3D, Raycaster, Vector2, Vector3, MathUtils, BoxHelper } from "three";
import { GLTFLoader } from "three-stdlib";
import { NinjaEditorContext } from "../NinjaEditorManager";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";
import { globalContentStore, globalPlayerStore } from "../Store";
import { PlayerInspector } from "../Inspector/PlayerInspector";
import { SkeletonUtils } from "three-stdlib";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { b64EncodeUnicode } from "@/commons/functional";
import { convertObjectToFile } from "@/src/utils/NinjaFileControl";


export const PlayerEditor = () => {
  const editor = useContext(NinjaEditorContext);
  const playerState = useSnapshot(globalPlayerStore);
  const ref: MutableRefObject<HTMLCanvasElement | null> = useRef<HTMLCanvasElement>(null);
  const [height, setHeight] = useState<number>(1.7);
  const [scene, setScene] = useState<Object3D>();
  const [selectAnim, setSelectAnim] = useState<string|undefined>();
  const [mixer, setMixer] = useState<AnimationMixer>();
  const [animations, setAnimations] = useState<AnimationClip[]>([]);
  const { t } = useTranslation();
  const contentState = useSnapshot(globalContentStore);
  const { data: session } = useSession();
  /**
   * ドラッグアンドドロップでモデルを読み込む
   * @param e 
   */
  const handleDrop: DragEventHandler<HTMLDivElement> = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const loader = new GLTFLoader();
    if (!contentState.currentType) {
      // 外部からのモデル読み込み
      const file = e.dataTransfer?.files[0];
      if (!file) return;
      loader.load(URL.createObjectURL(file), (gltf) => {
        const _mixer = new AnimationMixer(gltf.scene);
        setMixer(_mixer);
        setAnimations(gltf.animations);
        setScene(scene);
      });
    }
    else {
      // プロジェクト内のモデル読み込み
      const type = contentState.currentType;
      if (
        type == "gltf"
      ) {
        loader.load(
          contentState.currentUrl,
          async (gltf) => {
            const scene = gltf.scene || gltf.scenes[0] as Object3D;
            scene.traverse((node: Object3D) => {
              if (node instanceof Mesh && node.isMesh) {
                if (node.geometry) {
                  node.castShadow = true;
                  node.receiveShadow = true;
                }
              }
            });
            const _mixer = new AnimationMixer(scene);
            setMixer(_mixer);
            setAnimations(gltf.animations);
            globalPlayerStore.animations = gltf.animations;
            setScene(scene);
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

  const handleDragOver:DragEventHandler<HTMLDivElement>  = (e: React.DragEvent<HTMLDivElement>) => {
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
    if (target && mixer){
      const curAction = mixer.clipAction(target);
      curAction.enabled = true;
      curAction.play();
    }
  }

  const stopAnimation = (name: string) => {
    const target = animations.find(a => a.name == name);
    if (target && mixer){
      const curAction = mixer.clipAction(target);
      curAction.enabled = false;
      curAction.stop();
    }
  }

  const changeSelectAnim = (name: string) => {
      if (selectAnim) stopAnimation(selectAnim);
      setSelectAnim(name);
  }

  if (selectAnim){
    playAnimation(selectAnim);
  }

  
  const Model = ({ obj }) => {
    const ref2 = useRef();
    useHelper(ref2, BoxHelper);
    return (
      <primitive object={obj} ref={ref2} />
    )
  }

    /**
   * 保存する
   */
    const onSave = async (animMapper) => {
      // 最低限typeが選択されていればOK
      if (playerState.type && scene) {
        //ファイル名の確認
        const objectClone = scene.clone();
        const target = SkeletonUtils.clone(objectClone);
        target.animations = animations;
        const file = await convertObjectToFile(
          target, 
          { 
            animMapper: animMapper,
            type: playerState.type,
          }
        );
        Swal.fire({
          title: t("inputFileName"),
          input: 'text',
          showCancelButton: true,
          confirmButtonText: t("confirmSave"),
          showLoaderOnConfirm: true,
          preConfirm: async (inputStr: string) => {
            //バリデーションを入れたりしても良い
            if (inputStr.length == 0) {
              return Swal.showValidationMessage(t("leastInput"));
            }
            if (session){
              // ログインしていればストレージに保存
              const formData = new FormData();
              formData.append("file", file);
              const uploadPath = `users/${b64EncodeUnicode(session.user.email)}/players`;
              const keyPath = (uploadPath + `/${inputStr}.glb`).replaceAll("//", "/");
              formData.append("filePath", keyPath);
              try {
                const response = await fetch("/api/storage/upload", {
                  method: "POST",
                  body: formData,
                });
                if (!response.ok) {
                  throw new Error("Error uploading file");
                }
                const result = await response.json();
                // Success message
                Swal.fire({
                  icon: 'success',
                  title: t("success"),
                  text: t("saveSuccess") + `\npersonal/players/${inputStr}.glb`,
                });
              } catch (error) {
                console.error("Error:", error.message);
              }
            }
            else {
              // ログインしていなければダウンロード
              const link = document.createElement("a");
              link.href = URL.createObjectURL(file);
              link.download = `${inputStr}.glb`;
              link.click();
              link.remove();
            }
          },
          allowOutsideClick: function () {
            return !Swal.isLoading();
          }
        });
      }
      else {
        Swal.fire({
          icon: 'error',
          title: t("error"),
          text: t("leastSelect"),
        });
      }
    }

  return (
    <>
      <div 
        onDrop={handleDrop} 
        onDragOver={handleDragOver} 
        style={{ height: "100%" }}
      >
        {scene ?
          <>
            <Canvas camera={{ position: [0, 1.5, 3.5] }} ref={ref}>
              <Environment preset="dawn" blur={0.7} background />
              <OrbitControls />
              <gridHelper args={[4096, 4096]} />
              <Model obj={scene} />
              <PlayerEditorUpdate 
                selectAnim={selectAnim?selectAnim:""} 
                animations={animations} 
                mixer={mixer?mixer:new AnimationMixer(new Object3D())} 
                onCallback={changeSelectAnim}
                />
            </Canvas>
            <PlayerInspector onSave={onSave}/>
          </>
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