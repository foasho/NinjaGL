import React, { Suspense } from "react";
import { useRef, useEffect, useState } from "react";
import { IObjectManagement } from "../../utils";
import {
  Group,
  Vector3,
  Euler,
  AnimationAction,
  AnimationClip,
  Mesh,
  AnimationMixer,
  Object3D,
} from "three";
import { EDeviceType, useNinjaEngine, detectDeviceType } from "../../hooks";
import { useAnimations, useGLTF } from "@react-three/drei";
import { PlayerControl } from "./PlayerControls";
import { SkeletonUtils } from "three-stdlib";
import { useFrame } from "@react-three/fiber";

/**
 * Player表示
 * Playerが場合は通常のカメラを表示する
 * @returns
 */
interface IOMPlayerProps {
  grp: React.RefObject<Group>;
}
export const OMPlayer = ({ grp }: IOMPlayerProps) => {
  const ref = React.useRef<any>();
  const engine = useNinjaEngine();

  const player = React.useMemo(() => {
    if (!engine) return null;
    const avatar = engine.oms.find(
      (o: IObjectManagement) => o.type === "avatar"
    );
    return avatar ? avatar : null;
  }, [engine]);

  React.useEffect(() => {
    if (player && ref.current && engine) {
      if (player.args.position) {
        ref.current.position.copy(player.args.position.clone());
      }
      if (player.args.rotation) {
        ref.current.rotation.copy(player.args.rotation.clone());
      }
      if (player.args.scale) {
        ref.current.scale.copy(player.args.scale.clone());
      }
    }
  }, [player]);

  return (
    <>
      {player && (
        <Player
          grp={grp}
          objectURL={player.args.url as string}
          initPosition={player.args.position}
          initRotation={player.args.rotation}
          offsetY={player.args.offsetY}
          castShadow={player.args.castShadow}
          recieveShadow={player.args.recieveShadow}
        />
      )}
    </>
  );
};

/**
 * プレイヤー
 */
interface IPlayerProps {
  grp: React.RefObject<Group>;
  objectURL: string;
  initPosition?: Vector3;
  initRotation?: Euler;
  offsetY?: number;
  castShadow?: boolean;
  recieveShadow?: boolean;
  scale?: number;
}
export const Player = ({
  grp,
  objectURL,
  initPosition = new Vector3(0, 3, 0),
  initRotation = new Euler(0, 0, 0),
  offsetY = 3.0,
  castShadow = true,
  recieveShadow = false,
  scale = 1.0,
}: IPlayerProps) => {
  const { player: playerRef } = useNinjaEngine();
  const [device, setDevice] = useState<EDeviceType>(EDeviceType.Unknown);
  const { scene, animations } = useGLTF(objectURL) as any;
  const [clone, setClone] = useState<Object3D>();
  const [cloneMixer, setCloneMixer] = useState<AnimationMixer | null>(null);
  const [cloneActions, setCloneActions] = useState<{
    [key: string]: AnimationAction | null;
  } | null>(null);
  const p = initPosition ? initPosition : new Vector3(0, 0, 0);

  useEffect(() => {
    if (scene) {
      // cloneを作成
      const clone = SkeletonUtils.clone(scene);
      // animationsもコピー
      clone.animations = animations;
      if (clone.animations) {
        const mixer = new AnimationMixer(clone);
        const actions: {
          [key: string]: AnimationAction | null;
        } = {};
        clone.animations.forEach((clip: AnimationClip) => {
          actions[clip.name] = mixer.clipAction(clip);
        });
        // Shadowを適応
        clone.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = castShadow;
            child.receiveShadow = recieveShadow;
          }
        });
        setCloneMixer(mixer);
        setCloneActions(actions);
      }
      setClone(clone);
    }
    setDevice(detectDeviceType());
    // Storeに保持
    // setPlayerRef(playerRef);
  }, [scene, animations, objectURL]);

  return (
    <Suspense fallback={null}>
      <group renderOrder={1}>
        {clone && cloneMixer && cloneActions && (
          <>
            <mesh
              ref={playerRef}
              scale={scale}
              position={p}
              rotation={initRotation ? initRotation : new Euler(0, 0, 0)}
            >
              <primitive object={clone} />
            </mesh>
            <>
              {device !== EDeviceType.Unknown && (
                <PlayerControl
                  object={playerRef}
                  grp={grp}
                  mixer={cloneMixer}
                  actions={cloneActions}
                  resetPosition={initPosition}
                  resetPositionOffsetY={offsetY}
                  device={device}
                />
              )}
            </>
          </>
        )}
      </group>
    </Suspense>
  );
};
