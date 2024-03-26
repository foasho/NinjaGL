import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { OrbitControls, PerspectiveCamera as DPerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useSnapshot } from "valtio";

import { EDeviceType, useInputControl } from "@/hooks/useInputControl";
import { useNinjaEditor } from "@/hooks/useNinjaEditor";

import { editorStore, globalContentStore } from "../Store/Store";

const cd = new Vector3();
const cp = new Vector3();
const cr = new Vector3();
const cl = new Vector3();

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
export const MoveableCameraControl = (props: ICameraControl) => {
  const state = useSnapshot(editorStore);
  const contentState = useSnapshot(globalContentStore);
  const editor = useNinjaEditor();
  const ref = useRef<OrbitControlsImpl>(null);
  const cameraRef = useRef<PerspectiveCamera>(null);
  const { gl, camera } = useThree();
  const { input } = useInputControl({ device: EDeviceType.Desktop });
  // Fキーが押された瞬間にカメラをフォーカスするためのフラグ
  const [focusOnObject, setFocusOnObject] = useState(false);

  useLayoutEffect(() => {
    if (cameraRef && cameraRef.current) {
      const initCameraPosition = new Vector3().copy(contentState.cameraPosition);
      cameraRef.current.position.copy(initCameraPosition.clone());
      cameraRef.current.lookAt(0, 0, 0);
      camera.position.copy(initCameraPosition.clone());
      camera.lookAt(0, 0, 0);
      // targetFocusCamera('', initCameraPosition);
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
  const targetFocusCamera = (id: string, p: Vector3 | null = null) => {
    const position = p ? p : editor.getPosition(id);
    if (position) {
      const target = new Vector3().copy(position.clone());

      // ターゲットからカメラまでの距離を設定
      const distance = 5;

      // ターゲットの前方向ベクトルをカメラの現在の位置から計算
      const forwardDirection = new Vector3().subVectors(target, cameraRef.current!.position).normalize();
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
      // 縦方向を0.75倍の高さに
      upDirection.y = upDirection.y * 0.5;

      // ターゲットに上方向ベクトル、右方向ベクトル、背後方向ベクトルを加算して、フォーカス位置を計算
      const focusPosition = new Vector3().addVectors(target, upDirection).add(rightDirection).add(forwardDirection);


      cameraRef.current!.position.copy(focusPosition);
      cameraRef.current!.lookAt(target);
      if (ref && ref.current) {
        ref.current.target.copy(target);
      }
    }
  };

  const calculateNewTarget = (camera: PerspectiveCamera, distance: number) => {
    const direction = new Vector3();
    camera.getWorldDirection(direction);
    const newPosition = new Vector3().addVectors(camera.position, direction.multiplyScalar(distance));
    return newPosition;
  };

  useFrame((_, delta) => {
    if (ref.current){
      // カメラ操作を停止する
      ref.current.enabled = !editor.cameraStop.current;
    }
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
    const mode = state.mode;
    if (!input.dash && (input.forward || input.backward || input.right || input.left) && !state.currentId) {
      const st = props.cameraSpeed * delta * 10;
      const cameraDirection = cd;
      cameraRef.current!.getWorldDirection(cameraDirection);
      const cameraPosition = cp.copy(cameraRef.current!.position);

      if (input.forward) {
        cameraPosition.add(cd.multiplyScalar(st));
      }
      if (input.backward) {
        cameraPosition.sub(cd.multiplyScalar(st));
      }
      if (input.right) {
        const cameraRight = cr.set(0, 0, 0);
        cameraRight.crossVectors(cameraDirection, cameraRef.current!.up).normalize();
        cameraPosition.add(cameraRight.multiplyScalar(st));
      }
      if (input.left) {
        const cameraLeft = cl.set(0, 0, 0);
        cameraLeft.crossVectors(cameraDirection, cameraRef.current!.up).normalize();
        cameraPosition.sub(cameraLeft.multiplyScalar(st));
      }
      globalContentStore.cameraPosition.copy(cameraPosition);
      cameraRef.current!.position.copy(cameraPosition);
      ref.current!.target.copy(cameraPosition.add(cameraDirection));
    } else if (ref.current && cameraRef.current) {
      cameraRef.current.position.copy(ref.current.object.position);
      cameraRef.current.rotation.copy(ref.current.object.rotation);
      cameraRef.current.lookAt(ref.current.target);
    }

    if (ref.current && cameraRef.current) {
      // // 新しいターゲット位置を計算して更新します
      const distance = props.cameraSpeed * 10; // カメラとターゲットの一定距離を指定
      const newTarget = calculateNewTarget(cameraRef.current, distance);
      ref.current.target.copy(newTarget);
    }
  });

  return (
    <>
      <DPerspectiveCamera makeDefault ref={cameraRef} />
      <OrbitControls
        ref={ref}
        args={[cameraRef.current!, gl.domElement]}
        camera={cameraRef.current!}
        makeDefault={true}
      />
    </>
  );
};
