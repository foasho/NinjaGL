import React, { useEffect, useMemo, useRef, useState } from "react";
import { Html, useGLTF } from "@react-three/drei";
import { IPublishData, playTextToSpeech, useWebRTC } from "../../hooks";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, Quaternion, Vector3, Object3D } from "three";
import { SkeletonUtils } from "three-stdlib";
import { PlayerAnimationHelper } from "../../commons/PlayerAnimationHelper";
import { DisntanceVisible } from "../../helpers";
import { MultiPlayerColliderTunnel } from "../../utils";

export const Others = () => {
  const { membersData, me, onMembersChanged, offMembersChanged } = useWebRTC();
  const [othersData, setOthersData] = useState<IPublishData[]>([]);

  useEffect(() => {
    const update = () => {
      setOthersData(
        membersData.current.filter((m) => {
          return m.id !== me.current?.id;
        })
      );
    };
    update();
    onMembersChanged(update);
    return () => {
      offMembersChanged(update);
    };
  }, []);

  return (
    <>
      {othersData.map((data) => {
        return <OtherPlayer key={data.id} id={data.id!} />;
      })}
    </>
  );
};

interface IOtherPlayer {
  id: string;
  url?: string;
}
const OtherPlayer = ({ id, url = "/models/ybot.glb" }: IOtherPlayer) => {
  const otherRef = useRef<Group>(null);
  const messageRef = useRef<any>(null);
  const moveableCollisionRef = useRef<Mesh>(null);
  const { getMemberData } = useWebRTC();
  const [objUrl, setObjUrl] = useState<string>(url);
  const { scene, animations } = useGLTF(objUrl);
  const nowChange = useRef<boolean>(false);
  const [clone, setClone] = useState<Object3D | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (scene) {
      nowChange.current = true;
      const clone = SkeletonUtils.clone(scene);
      clone.animations = animations;
      clone.traverse((node) => {
        if (node instanceof Mesh) {
          node.castShadow = true;
        }
      });
      setClone(clone);
      nowChange.current = false;
    }
  }, [objUrl, scene]);

  useEffect(() => {
    if (message.length > 0) {
      playTextToSpeech({ text: message });
    }
  }, [message]);

  useFrame(() => {
    const pdata = getMemberData(id);
    if (pdata && otherRef.current) {
      // 位置/回転情報更新
      const { position, rotation } = pdata;
      // console.log("position", position);
      if (position && rotation) {
        // lerpを使って滑らかに移動
        otherRef.current.position.lerp(position, 0.2);
        // slerpを使って滑らかに回転
        otherRef.current.quaternion.slerp(
          new Quaternion().setFromEuler(rotation),
          0.2
        );
        // moveableCollisionの位置/回転情報更新
        if (moveableCollisionRef.current) {
          moveableCollisionRef.current.position.copy(position.clone());
          moveableCollisionRef.current.quaternion.copy(
            new Quaternion().setFromEuler(rotation)
          );
        }
      }
      if (pdata.objectURL && objUrl !== pdata.objectURL && !nowChange.current) {
        // objUrlが変更されたら、アニメーションを更新
        setObjUrl(pdata.objectURL);
      }
      // メッセージがあれば追加
      if (pdata.message && message !== pdata.message) {
        setMessage(pdata.message);
        setTimeout(() => {
          messageRef.current.visible = false;
          setMessage("");
        }, 5000);
      }
    }
    if (message && message.length > 0) {
      // messageのposition と rotation を更新
      const { position, rotation } = otherRef.current!;
      if (position && rotation) {
        // positionはやや高い位置
        const newPosition = position.clone().add(new Vector3(0, 2.5, 0));
        messageRef.current.position.lerp(newPosition, 0.2);
        messageRef.current.quaternion.slerp(
          new Quaternion().setFromEuler(rotation),
          0.2
        );
      }
    }
  });

  return (
    <>
      <DisntanceVisible>
        {clone ? (
          <group ref={otherRef}>
            <PlayerAnimationHelper id={id} object={clone} />
          </group>
        ) : (
          <group ref={otherRef}>
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={"#00FF00"} />
            </mesh>
          </group>
        )}
      </DisntanceVisible>
      {message && message.length > 0 && (
        <DisntanceVisible>
          <mesh ref={messageRef}>
            <Html>
              <div
                className={""}
                style={{
                  fontSize: "13px",
                  minWidth: "100px",
                  maxWidth: "200px",
                  background: "#fff",
                  borderRadius: "5px",
                  padding: "5px",
                  userSelect: "none",
                  marginTop: "50px",
                }}
              >
                {message}
              </div>
            </Html>
          </mesh>
        </DisntanceVisible>
      )}
      <MultiPlayerColliderTunnel.In>
        <mesh
          ref={moveableCollisionRef}
          visible={false}
          userData={{ shareId: id, phyType: "capsule" }}
        >
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      </MultiPlayerColliderTunnel.In>
    </>
  );
};
