import React from "react";
import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  StaticGeometryGenerator,
  MeshBVH,
  ExtendedTriangle,
} from "three-mesh-bvh";
import {
  Mesh,
  Vector3,
  Object3D,
  Box3,
  Line3,
  Matrix4,
  Group,
  BufferGeometry,
  Raycaster,
  AnimationAction,
  AnimationMixer,
  AnimationClip,
  DoubleSide,
} from "three";
import {
  EDeviceType,
  ENinjaStatus,
  useMultiInputControl,
  useNinjaEngine,
} from "../../hooks";
import {
  IInputMovement,
  CapsuleInfoProps,
  detectAABBCapsuleCollision,
  // checkSphereCapsuleIntersect,
  getInitCollision,
  detectCapsuleCapsuleCollision,
} from "../../utils";

/**
 * プレイヤー操作
 */
interface IPlayerControlProps {
  object: React.RefObject<Mesh | Object3D>;
  actions: { [key: string]: AnimationAction | null };
  mixer: AnimationMixer | null;
  grp: React.RefObject<Group>;
  cameraOffset?: Vector3;
  firstPerson?: boolean;
  resetPosition?: Vector3;
  resetPositionOffsetY?: number;
  desiredDistance?: number;
  touchDomId?: string | null;
  device: EDeviceType;
}
export const PlayerControl = ({
  object,
  actions,
  mixer,
  grp,
  cameraOffset = new Vector3(-0.25, 1, -5),
  firstPerson,
  resetPosition = new Vector3(0.0, 3, -30),
  resetPositionOffsetY = 3.0,
  desiredDistance = 3.5,
  touchDomId = "Ninjaviewer",
  device,
}: IPlayerControlProps) => {
  const {
    config,
    status,
    boundsTree,
    bvhCollider: collider,
    moveGrp,
    shareGrp,
    getOMById,
    playerIsOnGround,
    playerInfo,
  } = useNinjaEngine();
  const { input } = useMultiInputControl();
  const orbitTouchMove = useRef<{ flag: boolean; angleAxis: [number, number] }>(
    { flag: false, angleAxis: [0, 0] }
  );
  const isInit = useRef(true);
  const player = useRef<Mesh>(null);
  const capsuleInfo = useRef<CapsuleInfoProps>();
  const height = 2.0;
  capsuleInfo.current = {
    radius: 0.5,
    segment: new Line3(new Vector3(), new Vector3(0, -1.0, 0.0)),
  };
  const [grpMeshesNum, setGrpMeshesNum] = useState<number>(0);
  const p = useRef<Mesh>(null);
  const controls = useRef<OrbitControlsImpl>(null);
  // --- ジャンプ/物理判定に関連する変数 ---
  const playerVelocity = useRef(new Vector3(0, 0, 0));
  const tempBox = new Box3();
  const tempVector = new Vector3();
  const capsulePoint = new Vector3();
  const tempMat = new Matrix4();
  const tempSegment = new Line3(); // 衝突用の線分
  const gravity = -30;
  const deadZone = -25;
  const upVector = new Vector3(0, 1, 0);
  const baseSpeed = 2.5; // 移動速度を調整できるように定数を追加
  const physicsSteps = 5;
  const dashRatio = 2.1;
  const jumpInterval = 0.5; // (秒) ジャンプの連続入力を防ぐための定数
  const jumpEnabled = useRef<boolean>(true);
  const jumpTimer = useRef<number>(0);
  const jumpPower = 10;
  const jumpLag = 0.5; //(秒) ジャンプのラグを調整するための定数
  // ---------------------------
  const { camera, gl } = useThree();
  const raycaster = new Raycaster();
  raycaster.firstHitOnly = true;
  const [mergeGeometry, setMergeGeometry] = useState<BufferGeometry>();

  useEffect(() => {
    if (player.current) {
      player.current.position.copy(resetPosition.clone());
    }
    if (grpMeshesNum > 0 && grp.current) {
      // grpをマージして衝突を行うオブジェクトを作成する
      const staticGenerator = new StaticGeometryGenerator(grp.current);
      staticGenerator.attributes = ["position"];
      // @ts-ignore
      if (staticGenerator.meshes && staticGenerator.meshes.length > 0) {
        const mergedGeometry = staticGenerator.generate();
        // @ts-ignore
        mergedGeometry.boundsTree = new MeshBVH(mergedGeometry);
        boundsTree.current = mergedGeometry.boundsTree;
        setMergeGeometry(mergedGeometry);
      }
    }
  }, [grpMeshesNum]);

  useEffect(() => {
    let domElement = touchDomId
      ? document.getElementById(touchDomId)
      : gl.domElement;
    if (!domElement) {
      domElement = gl.domElement;
    }
    let posX: number | null = null;
    let posY: number | null = null;
    let touchId = -1;

    const touchStartHandler = (e: TouchEvent) => {
      const targetTouch = e.changedTouches[e.changedTouches.length - 1];
      touchId = targetTouch.identifier;
    };

    const touchMoveHandler = (e: TouchEvent) => {
      if (orbitTouchMove.current) {
        for (let i = 0; i < e.touches.length; i++) {
          const touch = e.touches[i];
          if (touch.identifier === touchId) {
            if (posX === null || posY === null) {
              posX = touch.pageX;
              posY = touch.pageY;
              return;
            }
            const diffX = touch.pageX - posX;
            const diffY = touch.pageY - posY;
            const delimeter = 10;
            const angleX = diffX / delimeter;
            const angleY = diffY / delimeter;
            orbitTouchMove.current = {
              flag: true,
              angleAxis: [angleX, angleY],
            };
            posX = touch.pageX;
            posY = touch.pageY;
          }
        }
      }
    };

    const touchEndHandler = () => {
      posX = null;
      posY = null;
      touchId = -1;
      orbitTouchMove.current = { flag: false, angleAxis: [0, 0] };
    };

    if (device === EDeviceType.Mobile || device === EDeviceType.Tablet) {
      domElement.addEventListener("touchstart", touchStartHandler);
      domElement.addEventListener("touchmove", touchMoveHandler);
      domElement.addEventListener("touchend", touchEndHandler);
    }

    return () => {
      if (device === EDeviceType.Mobile || device === EDeviceType.Tablet) {
        if (domElement) {
          domElement.removeEventListener("touchstart", touchStartHandler);
          domElement.removeEventListener("touchmove", touchMoveHandler);
          domElement.removeEventListener("touchend", touchEndHandler);
        }
      }
    };
  }, [gl.domElement]);

  const reset = () => {
    if (player.current) {
      playerVelocity.current.set(0, 0, 0);
      player.current.position.copy(
        resetPosition.clone().add(new Vector3(0, resetPositionOffsetY, 0))
      );
      camera.position.sub(controls.current!.target);
      controls.current!.target.copy(player.current.position);
      camera.position.add(player.current.position);
      controls.current!.update();
    }
  };

  useEffect(() => {
    if (player.current) {
      player.current.geometry.translate(0, -0.5, 0);
      // カメラを初期位置に設定
      camera.position.copy(resetPosition.clone().add(cameraOffset));
      if (isInit.current) {
        reset();
        isInit.current = false;
      }
    }
    return () => {
      if (player.current) {
        player.current.geometry.translate(0, 0.5, 0);
      }
      // 現在再生中のアニメーションを停止する
      for (const key in actions) {
        if (actions[key]) actions[key]!.stop();
      }
    };
  }, [actions]);

  const updateAnimation = (input: IInputMovement, delta: number) => {
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
    if (actions["Jump"] && !playerIsOnGround.current) {
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

    /**
     * アニメーションの更新
     */
    if (mixer) mixer.update(delta);
  };

  const updatePlayer = (delta: number) => {
    if (
      player.current &&
      controls.current &&
      collider.current &&
      mergeGeometry
    ) {
      /**
       * 処理順序
       * Step1. 入力データから移動方向ベクトルを計算
       * Step2. 衝突検出からの方向ベクトルで位置を調整
       * Step3. 動作オブジェクト(moveable)との衝突検出からの方向ベクトルで位置を調整
       * Step4. シェアオブジェクト(share)との衝突検出からの方向ベクトルで位置を調整
       * Step5. 衝突微調整を加算
       * Step6. オブジェクト/カメラの位置を同期
       */
      if (playerIsOnGround.current) {
        playerVelocity.current.y = delta * gravity;
      } else {
        playerVelocity.current.y += delta * gravity;
      }
      player.current.position.addScaledVector(playerVelocity.current, delta);

      /**
       * @step1 入力データ(input)からの単純な移動
       */
      let speed = baseSpeed * input.speed;
      if (input.dash) {
        speed *= dashRatio;
      }
      const angle = controls.current.getAzimuthalAngle();
      // console.log("input2: " ,input.forward)
      let forwardAmount = input.forward - input.backward;
      let movementVector = new Vector3(0, 0, 0);
      // 前後方向の移動
      if (forwardAmount !== 0) {
        tempVector
          .set(0, 0, -1 * forwardAmount)
          .applyAxisAngle(upVector, angle);
        movementVector.add(tempVector);
      }
      // 左右方向の移動
      let rightAmount = input.right - input.left;
      if (rightAmount !== 0) {
        tempVector.set(rightAmount, 0, 0).applyAxisAngle(upVector, angle);
        movementVector.add(tempVector);
      }

      // 移動量があれば、その移動方向に応じてObjectのY軸を回転させる
      if (forwardAmount !== 0 || rightAmount !== 0) {
        const targetRotation = Math.atan2(movementVector.x, movementVector.z);
        object.current!.rotation.y = targetRotation;
        // ここで移動量をセット
        player.current.position.addScaledVector(movementVector, speed * delta);
      }
      player.current.updateMatrixWorld();

      /**
       * 衝突検出を行い、その方向に移動量を調整
       */
      if (collider.current && capsuleInfo.current) {
        tempBox.makeEmpty();
        tempMat.copy(collider.current.matrixWorld).invert();
        tempSegment.copy(capsuleInfo.current.segment);

        // ローカル空間内のユーザーの位置を取得
        tempSegment.start
          .applyMatrix4(player.current.matrixWorld)
          .applyMatrix4(tempMat);
        tempSegment.end
          .applyMatrix4(player.current.matrixWorld)
          .applyMatrix4(tempMat);
        // 軸が整列した境界ボックスを取得
        tempBox.expandByPoint(tempSegment.start);
        tempBox.expandByPoint(tempSegment.end);

        tempBox.min.addScalar(-capsuleInfo.current.radius);
        tempBox.max.addScalar(capsuleInfo.current.radius);

        // 衝突を検出
        if (!collider.current.geometry.boundsTree) return;
        collider.current.geometry.boundsTree.shapecast({
          intersectsBounds: (_box: Box3) => {
            return _box.intersectsBox(tempBox);
          },
          intersectsTriangle: (tri: ExtendedTriangle) => {
            const triPoint = tempVector;
            // const capsulePoint = tempVector2;
            const distance = tri.closestPointToSegment(
              tempSegment,
              triPoint,
              capsulePoint
            );
            if (distance < capsuleInfo.current!.radius) {
              const depth = capsuleInfo.current!.radius - distance;
              const direction = capsulePoint.sub(triPoint).normalize();
              // tempSegmentは衝突で移動すべき遷移座標
              tempSegment.start.addScaledVector(direction, depth);
              tempSegment.end.addScaledVector(direction, depth);
            }
          },
        });
      }

      /**
       * @step3 動作オブジェクト(moveable)との衝突検出を行い、同様にその方向に移動量を調整
       */
      let collided = getInitCollision();
      if (moveGrp.current && capsuleInfo.current && p.current) {
        // First Intersect Only
        for (const object of moveGrp.current.children) {
          const om = getOMById(object.userData.omId);
          if (!om) continue;
          if (om.phyType == "box") {
            collided = detectAABBCapsuleCollision(
              object as Mesh,
              player.current
            );
            const {
              intersect,
              distance,
              castDirection,
              recieveDirection,
              point,
            } = collided;
            if (intersect) {
              // 衝突していれば、player.current.hitsに衝突したオブジェクトを追加
              player.current.userData.hits.push(om.id);
              if (p.current) p.current.position.copy(point);
              // TODO: direction方向がYの場合は、heightで比較する
              const depth =
                Math.abs(castDirection.y) > 0
                  ? height - capsuleInfo.current.radius - distance
                  : capsuleInfo.current.radius - distance;
              if (depth > 0) {
                const movement = castDirection.addScalar(depth);
                tempSegment.start.addScaledVector(movement, depth);
                tempSegment.end.addScaledVector(movement, depth);
                break;
              }
            }
          }
        }
      }

      /**
       * @step4 シェアオブジェクト(share)との衝突検出を行い、同様にその方向に移動量を調整
       */
      if (shareGrp.current && capsuleInfo.current && p.current) {
        // First Intersect Only
        for (const object of shareGrp.current.children) {
          if (object.userData.phyType == "box") {
            collided = detectAABBCapsuleCollision(
              object as Mesh,
              player.current
            );
            const {
              intersect,
              distance,
              castDirection,
              recieveDirection,
              point,
            } = collided;
            if (intersect) {
              // 衝突していれば、player.current.hitsに衝突したオブジェクトを追加
              player.current.userData.hits.push(object.userData.shareId);
              if (p.current) p.current.position.copy(point);
              const depth =
                Math.abs(castDirection.y) > 0
                  ? height - capsuleInfo.current.radius - distance
                  : capsuleInfo.current.radius - distance;
              if (depth > 0) {
                const movement = castDirection.addScalar(depth);
                tempSegment.start.addScaledVector(movement, depth);
                tempSegment.end.addScaledVector(movement, depth);
                break;
              }
            }
          } else if (object.userData.phyType == "capsule") {
            collided = detectCapsuleCapsuleCollision(
              object as Mesh,
              player.current
            );
            const {
              intersect,
              distance,
              castDirection,
              recieveDirection,
              point,
            } = collided;
            // console.log("intersect: ", intersect)
            if (p.current) {
              p.current.position.copy(point);
            }
          }
        }
      }

      if (!collided.intersect) {
        // 衝突していなければ、player.current.hitsを初期化
        if (player.current.userData.hits) {
          player.current.userData.hits = [];
        }
      }

      /**
       * @step5 衝突微調整を加算
       */
      const newPosition = tempVector;
      newPosition
        .copy(tempSegment.start)
        .applyMatrix4(collider.current.matrixWorld);
      const deltaVector = capsulePoint;
      deltaVector.subVectors(newPosition, player.current.position);

      // 接地判定: 移動ベクトルのY成分が,player速度のY成分の絶対値の1/4より大きい場合は接地していないと判定
      playerIsOnGround.current =
        deltaVector.y > Math.abs(delta * playerVelocity.current.y * 0.25);

      const offset = Math.max(0.0, deltaVector.length() - 1e-5);
      deltaVector.normalize().multiplyScalar(offset);

      player.current.position.add(deltaVector);

      /**
       * @step6 オブジェクト/カメラの位置を同期
       */
      // Player(Capsule)とObjectの位置を同期
      if (object.current) {
        object.current.position.copy(
          player.current.position
            .clone()
            .add(new Vector3(0, -(height - capsuleInfo.current!.radius), 0))
        );
      }
      // 接地処理
      if (!playerIsOnGround.current) {
        // 接地していない場合は、player速度にdeltaVector方向*重力分の移動ベクトルを追加
        deltaVector.normalize();
        playerVelocity.current.addScaledVector(
          deltaVector,
          -deltaVector.dot(playerVelocity.current)
        );
      } else {
        // 接地している場合は、速度を０にして静止する
        playerVelocity.current.set(0, 0, 0);
      }

      // カメラとの距離を調整
      camera.position.sub(controls.current.target);
      controls.current.target.copy(player.current.position);
      camera.position.add(player.current.position);

      // CameraからPlayerに向けてRaycastを行い、障害物があればカメラを障害物の位置に移動
      if (playerInfo.current.cameraMode === "third") {
        const objectPosition = player.current.position
          .clone()
          .add(new Vector3(0, height / 2, 0));
        const direction = objectPosition
          .clone()
          .sub(camera.position.clone())
          .normalize();
        const distance = camera.position.distanceTo(objectPosition);
        raycaster.set(camera.position, direction); // Raycast起源点をカメラに
        raycaster.far = distance - height / 2;
        raycaster.near = 0.01;
        const intersects = raycaster.intersectObject(collider.current!, true); // 全てのオブジェクトを対象にRaycast
        if (intersects.length > 0) {
          // 複数のオブジェクトに衝突した場合、distanceが最も近いオブジェクトを選択
          const target = intersects.reduce((prev, current) => {
            return prev.distance < current.distance ? prev : current;
          });
          camera.position.copy(target.point);
        } else if (forwardAmount !== 0 || rightAmount !== 0) {
          // 障害物との交差がない場合はプレイヤーから一定の距離を保つ
          const directionFromPlayerToCamera = camera.position
            .clone()
            .sub(objectPosition)
            .normalize();
          // カメラの位置をプレイヤーから一定の距離を保つように調整※カメラのカクツキを防ぐためにLerpを使用
          camera.position.lerp(
            objectPosition
              .clone()
              .add(directionFromPlayerToCamera.multiplyScalar(desiredDistance)),
            0.1
          );
        }
      }

      // デッドゾーンまで落ちたらリセット
      if (player.current.position.y < deadZone) {
        reset();
      }
    }
  };

  useFrame((_state, delta) => {
    if (status.current === ENinjaStatus.Pause) {
      return;
    }
    const timeDelta = Math.min(delta, 0.1);
    // grp.currentのchildrenの数を取得
    const meshesNum = grp.current ? grp.current.children.length : 0;
    if (meshesNum !== grpMeshesNum) {
      setGrpMeshesNum(meshesNum);
    }
    // OrbitTouchMoveが有効な場合は、OrbitControlsを無効にする
    if (orbitTouchMove.current.flag && controls.current) {
      controls.current.enabled = false;
    }
    // ジャンプの入力を受け付ける
    if (input.jump && playerIsOnGround.current && jumpEnabled.current) {
      jumpEnabled.current = false;
      setTimeout(() => {
        jumpEnabled.current = true;
      }, jumpInterval * 1000);
      playerVelocity.current.setY(jumpPower);
      playerIsOnGround.current = false;
    }
    // OrbitsContolsの設定
    if (controls.current && playerInfo.current.cameraMode === "first") {
      controls.current.maxPolarAngle = Math.PI;
      controls.current.minDistance = 1e-4;
      controls.current.maxDistance = 1e-4;
      if (object.current && object.current.visible) {
        object.current.visible = false;
      }
    } else if (controls.current) {
      // ThirdPerson
      controls.current.minDistance = 1;
      controls.current.maxDistance = desiredDistance;
      if (object.current && !object.current.visible) {
        object.current.visible = true;
      }
    }
    if (collider.current) {
      for (let i = 0; i < physicsSteps; i++) {
        updatePlayer(timeDelta / physicsSteps);
      }
    }
    // カメラの移動
    if (controls.current) {
      let axisX = 0;
      let axisY = 0;
      if (
        Math.abs(input.angleAxis[0]) > 0 ||
        Math.abs(input.angleAxis[1]) > 0
      ) {
        const cameraSpeed = 0.27;
        axisX = input.angleAxis[0] * cameraSpeed;
        axisY = input.angleAxis[1] * cameraSpeed;
      } else if (
        orbitTouchMove.current &&
        orbitTouchMove.current.flag &&
        (Math.abs(orbitTouchMove.current.angleAxis[0]) > 0 ||
          Math.abs(orbitTouchMove.current.angleAxis[1]) > 0)
      ) {
        const cameraSpeed = 0.27;
        axisX = orbitTouchMove.current.angleAxis[0] * cameraSpeed;
        axisY = orbitTouchMove.current.angleAxis[1] * cameraSpeed;
      }
      if (axisX !== 0 || axisY !== 0) {
        // 今向いている方向からX軸方向に移動
        const direction = new Vector3(-1, 0, 0);
        direction.applyQuaternion(camera.quaternion);
        direction.normalize();
        direction.multiplyScalar(axisX);
        camera.position.add(direction);
        // 今向いている方向からY軸方向に移動
        const direction2 = new Vector3(0, 1, 0);
        direction2.applyQuaternion(camera.quaternion);
        direction2.normalize();
        direction2.multiplyScalar(axisY);
        camera.position.add(direction2);
      }
      controls.current.update();
    }
    updateAnimation(input, timeDelta);
  });

  return (
    <>
      <OrbitControls
        ref={controls}
        args={[camera, gl.domElement]}
        camera={camera}
        makeDefault={true}
        // スマホタブレットの場合は、OrbitControlsを無効にする
        enabled={
          device === EDeviceType.Mobile || device === EDeviceType.Tablet
            ? false
            : true
        }
      />
      {/** 以下は物理判定Playerの可視化用：強制的に非表示に設定 */}
      <mesh ref={player} visible={config.isDebug} userData={{ hits: [] }}>
        <capsuleGeometry
          args={[
            capsuleInfo.current.radius,
            height - capsuleInfo.current.radius * 2,
            1,
            6,
          ]}
        />
        <meshBasicMaterial wireframe color={0xffff00} side={DoubleSide} />
      </mesh>
      <mesh ref={p} visible={config.isDebug}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial wireframe color={0xff0000} side={DoubleSide} />
      </mesh>
      {mergeGeometry && (
        <mesh ref={collider} visible={config.isDebug} name="collider">
          <primitive object={mergeGeometry} />
          <meshBasicMaterial wireframe color={0x00ff00} />
        </mesh>
      )}
    </>
  );
};
