import { useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { MutableRefObject } from "react";
import { Object3D } from "three";
import { IInputMovement } from "../utils";
import { useNinjaWorker, useWebRTC } from "../hooks";

type PlayerAnimationHelperProps = {
  id: string;
  object: Object3D;
};
export const PlayerAnimationHelper = ({
  id,
  object,
}: PlayerAnimationHelperProps) => {
  const animations = object.animations;
  const { ref, actions, mixer } = useAnimations(animations);
  const { getMemberData } = useWebRTC();
  const { worker } = useNinjaWorker();
  const jumpTimer = React.useRef<number>(0);
  const jumpLag = 0.5;

  const updateAnimation = (
    input: IInputMovement,
    delta: number,
    playerIsOnGround: boolean
  ) => {
    /**
     * 左右前後のアニメーション
     */
    if (
      input.forward !== 0 ||
      input.backward !== 0 ||
      input.left !== 0 ||
      input.right !== 0
    ) {
      // 歩きの時は歩きのアニメーションを再生
      if (actions["Walk"] && !input.dash) {
        // Walkが以外を停止
        Object.keys(actions).forEach((key) => {
          if (key !== "Walk" && key !== "Jump" && actions[key]) {
            actions[key]!.stop();
          }
        });
        actions["Walk"].play();
      } else if (actions["Run"] && input.dash) {
        // ダッジュ以外を停止
        Object.keys(actions).forEach((key) => {
          if (key !== "Run" && key !== "Jump" && actions[key]) {
            actions[key]!.stop();
          }
        });
        // ダッシュの時はダッシュのアニメーションを再生
        actions["Run"].play();
      }
    } else {
      // 何もないときは、Idleを再生し、Idle以外が再生されていれば停止
      if (actions["Idle"]) {
        actions["Idle"].play();
        Object.keys(actions).forEach((key) => {
          if (key !== "Idle" && key !== "Jump" && actions[key]) {
            actions[key]!.stop();
          }
        });
      }
    }

    /**
     * ジャンプのアニメーション
     */
    if (actions["Jump"] && !playerIsOnGround) {
      // Jump以外を停止
      Object.keys(actions).forEach((key) => {
        if (key !== "Jump" && actions[key]) {
          actions[key]!.stop();
        }
      });
      actions["Jump"].play();
      if (mixer && jumpTimer.current == 0) {
        mixer.setTime(jumpLag);
      }
      jumpTimer.current += delta;
    } else {
      if (actions["Jump"]) {
        actions["Jump"].stop();
      }
      jumpTimer.current = 0;
    }
  };

  useFrame((_state, delta) => {
    const pdata = getMemberData(id);
    if (pdata) {
      // 位置/回転情報更新
      const { input, playerIsOnGround } = pdata;
      if (input) updateAnimation(input, delta, playerIsOnGround ? true : false);
    }
  });

  return (
    <primitive
      ref={ref}
      onClick={() => {
        if (worker.current) {
          worker.current.postMessage({
            type: "click",
            id: id,
          });
        }
      }}
      onDoubleClick={() => {
        if (worker.current) {
          worker.current.postMessage({
            type: "doubleclick",
            id: id,
          });
        }
      }}
      object={object}
    />
  );
};
