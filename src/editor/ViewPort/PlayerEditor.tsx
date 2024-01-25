import { Suspense, useEffect, useRef, useState } from "react";

import { convertObjectToFile } from "@ninjagl/core";
import { ContactShadows, Environment, OrbitControls, Text, useAnimations, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useSession } from "next-auth/react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { AnimationClip, Box3, Group, Vector3 } from "three";
import { SkeletonUtils } from "three-stdlib";
import tunnel from "tunnel-rat";

import { b64EncodeUnicode } from "@/commons/functional";
import { Loading2D } from "@/commons/Loading2D";
import { MySwal } from "@/commons/Swal";
import { uploadFile } from "@/utils/upload";

import { globalEditorStore } from "../Store/editor";

const dom = tunnel();

interface ITpConfig {
  scale: number;
  idle: string;
  walk: string;
  run: string;
  jump: string;
  weapon: string;
  subWeapon: string;
}

export const PlayerEditor = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<File | null>(null);
  const { t } = useTranslation();
  const { data: session } = useSession();

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return;
    const files = e.dataTransfer.files;
    if (files.length > 0 && session) {
      const file = files[0];
      // ファイル名が.glbか.gltfでなければエラー
      const ext = file.name.split(".").pop();
      if (ext !== "glb" && ext !== "gltf") {
        MySwal.fire({
          icon: "error",
          title: t("error"),
          text: t("leastSelectGLTF"),
        });
        return;
      }
      setSelected(file);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault(); // ブラウザのデフォルト動作をキャンセルする
  };

  /**
   * 保存する
   */
  const onSave = async (config: ITpConfig, scene, animations) => {
    // 最低限typeが選択されていればOK
    if (scene) {
      //ファイル名の確認
      const target = SkeletonUtils.clone(scene);
      target.animations = animations;
      target.userData = config;
      const file = await convertObjectToFile(target);
      MySwal.fire({
        title: t("inputFileName"),
        input: "text",
        showCancelButton: true,
        confirmButtonText: t("confirmSave"),
        showLoaderOnConfirm: true,
        preConfirm: async (inputStr: string) => {
          //バリデーションを入れたりしても良い
          if (inputStr.length == 0) {
            return MySwal.showValidationMessage(t("leastInput"));
          }
          if (session) {
            // ログインしていればストレージに保存
            const formData = new FormData();
            formData.append("file", file);
            const filePath = `${b64EncodeUnicode(session.user!.email as string)}/Characters/${inputStr}.glb`;
            try {
              const res = await uploadFile(file, filePath);
              if (!res || !res.url) {
                throw new Error("Error uploading file");
              }
              MySwal.fire({
                icon: "success",
                title: t("success"),
                text: t("saveSuccess") + `\nCharacters/${inputStr}.glb`,
              });
              globalEditorStore.viewSelect = "mainview";
            } catch (error) {
              console.error("Error:", error.message);
            }
          }
        },
        allowOutsideClick: function () {
          return !Swal.isLoading();
        },
      });
    } else {
      // @ts-ignore
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("leastSelect"),
      });
    }
  };

  return (
    <>
      <div className='relative h-full'>
        <div className='absolute right-4 top-8 z-20 w-48 rounded-lg bg-cyber/50 p-3'>
          <dom.Out />
        </div>
        {selected ? (
          <Suspense fallback={<Loading2D className='h-full bg-cyber' />}>
            <Canvas shadows>
              <Environment preset='dawn' blur={0.7} background />
              <OrbitControls />
              <ModelPreview url={URL.createObjectURL(selected)} onSave={onSave} />
            </Canvas>
          </Suspense>
        ) : (
          <>
            <div
              style={{ background: "#121212", height: "100%", position: "relative" }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.click();
                }
              }}
            >
              <div
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  position: "absolute",
                  width: "100%",
                  textAlign: "center",
                  top: "50%",
                  left: "50%",
                  maxWidth: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {t("uploadGLTF")}
              </div>
              <input
                type='file'
                ref={inputRef}
                className='hidden'
                accept='.glb,.gltf'
                onInput={(e) => {
                  if (e.currentTarget.files) {
                    if (e.currentTarget.files.length > 0) {
                      setSelected(e.currentTarget.files[0]);
                    }
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

type ModelPreviewProps = {
  url: string;
  onSave: (config: ITpConfig, scene: any, animations: AnimationClip[]) => void;
};
const ModelPreview = ({ url, onSave }: ModelPreviewProps) => {
  const { scene, animations } = useGLTF(url);
  const { ref, mixer, actions } = useAnimations(animations);
  const { t } = useTranslation();
  const grp = useRef<Group>(null);
  const [size, setSize] = useState<Vector3>(new Vector3());
  const [scale, setScale] = useState(1);
  const [idleAnimName, setIdleAnimName] = useState("Walk");
  const [walkAnimName, setWalkAnimName] = useState("Walk");
  const [runAnimName, setRunAnimName] = useState("Run");
  const [jumpAnimName, setJumpAnimName] = useState("Jump");
  const [weaponAnimName, setWeaponAnimName] = useState("Weapon");
  const [subWeaponAnimName, setSubWeaponAnimName] = useState("SubWeapon");

  useEffect(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    setSize(size);
    if (actions && actions["Idle"]) {
      actions["Idle"].play();
    }
  }, [scene]);

  const onPlay = (value) => {
    Object.keys(actions).map((key) => {
      actions[key]?.stop();
    });
    actions[value]?.play();
  };

  /**
   * Idleアニメーションの選択
   */
  const onSelectIdle = (e: any) => {
    setIdleAnimName(e.target.value);
    onPlay(e.target.value);
  };

  /**
   * 歩くモーションの選択
   */
  const onSelectWalk = (e: any) => {
    setWalkAnimName(e.target.value);
    onPlay(e.target.value);
  };

  /**
   * Jumpモーションの選択
   */
  const onSelectJump = (e: any) => {
    setJumpAnimName(e.target.value);
    onPlay(e.target.value);
  };

  /**
   * Runモーションの選択
   */
  const onSelectRun = (e: any) => {
    setRunAnimName(e.target.value);
    onPlay(e.target.value);
  };

  /**
   * Weaponモーションの選択
   */
  const onSelectWeapon = (e: any) => {
    setWeaponAnimName(e.target.value);
    onPlay(e.target.value);
  };

  /**
   * Subweaponモーションの選択
   */
  const onSelectSubWeapon = (e: any) => {
    setSubWeaponAnimName(e.target.value);
    onPlay(e.target.value);
  };

  return (
    <>
      {/* <Center> */}
      <group ref={grp}>
        {/** @ts-ignore */}
        <mesh ref={ref} scale={scale}>
          <primitive object={scene} />
        </mesh>
        <ContactShadows />
      </group>
      {/* </Center> */}
      <group position={[0.5, 0, 0]}>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[0.5, 0.03, 0.03]} />
          <meshStandardMaterial color='red' />
        </mesh>
        <Text position={[0.5, 2, 0]} scale={0.25} color={"red"}>
          2m
        </Text>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.25, 0.03, 0.03]} />
          <meshStandardMaterial color='red' />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.5, 0.03, 0.03]} />
          <meshStandardMaterial color='red' />
        </mesh>
        <Text position={[0.5, 1, 0]} scale={0.25} color={"red"}>
          1m
        </Text>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.25, 0.03, 0.03]} />
          <meshStandardMaterial color='red' />
        </mesh>
        <mesh>
          <boxGeometry args={[0.5, 0.03, 0.03]} />
          <meshStandardMaterial color='red' />
        </mesh>
      </group>
      <dom.In>
        <div>
          <div>
            <div className='pt-2 font-bold'>
              <span>
                {t("scale")}: {scale.toFixed(1)}
              </span>
            </div>
            <input
              type='range'
              min={0.01}
              max={10}
              step={0.01}
              value={scale}
              onChange={(e) => {
                setScale(parseFloat(e.target.value));
              }}
            />
          </div>
        </div>
        <div>
          <div className='pt-2 font-bold'>
            <span>{t("motionSelect")}</span>
          </div>
          {/** Idle設定 */}
          <div className='pt-2'>
            <div>{t("idle")}</div>
            <select className='rounded-sm' defaultValue={"Idle"} onChange={onSelectIdle}>
              {/* アニメーション一覧 */}
              {Object.keys(actions).map((key, idx) => {
                return (
                  <option key={`idle-${idx}`} value={key}>
                    {key}
                  </option>
                );
              })}
            </select>
          </div>
          {/** 歩く設定 */}
          <div className='pt-2'>
            <div>{t("walk")}</div>
            <select className='rounded-sm' defaultValue={"Walk"} onChange={onSelectWalk}>
              {/* アニメーション一覧 */}
              {Object.keys(actions).map((key, idx) => {
                return (
                  <option key={`walk-${idx}`} value={key}>
                    {key}
                  </option>
                );
              })}
            </select>
          </div>
          {/** 走る設定 */}
          <div className='pt-2'>
            <div>{t("run")}</div>
            <select className='rounded-sm' defaultValue={"Run"} onChange={onSelectRun}>
              {/* アニメーション一覧 */}
              {Object.keys(actions).map((key, idx) => {
                return (
                  <option key={`run-${idx}`} value={key}>
                    {key}
                  </option>
                );
              })}
            </select>
          </div>
          {/** ジャンプ設定 */}
          <div className='pt-2'>
            <div>{t("jump")}</div>
            <select className='rounded-sm' defaultValue={"Jump"} onChange={onSelectJump}>
              {/* アニメーション一覧 */}
              {Object.keys(actions).map((key, idx) => {
                return (
                  <option key={`jump-${idx}`} value={key}>
                    {key}
                  </option>
                );
              })}
            </select>
          </div>
          {/** ウェポン設定 */}
          <div className='pt-2'>
            <div>{t("weapon")}</div>
            <select className='rounded-sm' defaultValue={"Weapon"} onChange={onSelectWeapon}>
              {/* アニメーション一覧 */}
              {Object.keys(actions).map((key, idx) => {
                return (
                  <option key={`weapon-${idx}`} value={key}>
                    {key}
                  </option>
                );
              })}
            </select>
          </div>
          {/** サブウェポン */}
          <div className='py-2'>
            <div>{t("subWeapon")}</div>
            <select className='rounded-sm' defaultValue={"SubWeapon"} onChange={onSelectSubWeapon}>
              {/* アニメーション一覧 */}
              {Object.keys(actions).map((key, idx) => {
                return (
                  <option key={`subweapon-${idx}`} value={key}>
                    {key}
                  </option>
                );
              })}
            </select>
          </div>
          {/** 保存ボタン */}
          <div>
            <button
              className='my-2 w-full rounded bg-primary/50 px-4 py-2 font-bold text-white hover:bg-primary/75'
              onClick={() => {
                onSave(
                  {
                    scale: scale,
                    idle: idleAnimName,
                    walk: walkAnimName,
                    run: runAnimName,
                    jump: jumpAnimName,
                    weapon: weaponAnimName,
                    subWeapon: subWeaponAnimName,
                  },
                  scene,
                  animations,
                );
              }}
            >
              {t("save")}
            </button>
          </div>
        </div>
      </dom.In>
    </>
  );
};
