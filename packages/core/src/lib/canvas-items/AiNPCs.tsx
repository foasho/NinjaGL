import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import {
  Vector3,
  Euler,
  Group,
  MathUtils,
  AnimationMixer,
  Object3D,
} from "three";
import { playTextToSpeech, useWebRTC } from "../hooks";
import { useNinjaEngine } from "../hooks";
import { SkeletonUtils } from "three-stdlib";
import { AnimationHelper } from "../helpers";
import { IObjectManagement } from "../utils";
import { DisntanceVisible } from "../helpers";
import { GLTFResult } from "../types";

export const AiNPCs = () => {
  const { oms } = useNinjaEngine();
  const ainpcs = oms.filter((om) => om.type === "ai-npc");
  return (
    <>
      {ainpcs.map((ainpc) => (
        <AiNPC
          key={ainpc.id}
          om={ainpc}
          npcName={ainpc.args.npcName}
          objectURL={ainpc.args.url}
          system={ainpc.args.system}
          apiRoute={ainpc.args.apiRoute}
          position={ainpc.args.position}
          rotation={ainpc.args.rotation}
          scale={ainpc.args.scale}
          trackingRotation={ainpc.args.trackingRotation}
          conversationDistance={ainpc.args.conversationDistance}
          talkSpeed={ainpc.args.talkSpeed}
          isSpeak={ainpc.args.isSpeak}
        />
      ))}
    </>
  );
};

interface IConversationProps {
  role: "system" | "user" | "assistant";
  content: string;
}

const initSystem = `あなたはゲームのNPCとしての会話をふるまってください。私がPlayerで、これから会話シミュレーションを行います。返答はこれから行う入力言語に合わせてください。`;

/**
 * NPC
 */
export interface AiNPCProps {
  om: IObjectManagement;
  npcName?: string;
  objectURL?: string;
  system?: string;
  apiRoute?: string;
  trackingRotation?: boolean;
  trackingNodeName?: string;
  conversationDistance?: number;
  position?: Vector3;
  rotation?: Euler;
  rangeAzimuthAngle?: number;
  scale?: Vector3;
  randomMoveRange?: Vector3 | [number, number, number];
  textBackground?: string;
  talkSpeed?: number;
  isSpeak?: boolean;
  isRandomMove?: boolean;
}
export const AiNPC = ({
  om,
  npcName = "NPC",
  objectURL = "/models/ybot.glb",
  system = initSystem,
  apiRoute = "/api/npc/conversations",
  trackingRotation = true,
  trackingNodeName = undefined,
  conversationDistance = 5,
  position = new Vector3(0, 0, 0),
  rotation = new Euler(0, 0, 0),
  rangeAzimuthAngle = undefined,
  scale = new Vector3(1, 1, 1),
  randomMoveRange = [0, 0, 0],
  textBackground = "#43D9D9bb",
  talkSpeed = 2.0,
  isSpeak = true,
  isRandomMove = false,
}: AiNPCProps) => {
  const target = useRef<Group | null>(null);
  const mesHtmlRef = useRef<any>(null);
  const { scene, animations, nodes } = useGLTF(objectURL) as GLTFResult;
  const [localMessage, setLocalMessage] = useState<string>("");
  const { player, curMessage, config, apiEndpoint, npcChatHistory } = useNinjaEngine();
  const { publishData } = useWebRTC();
  const [conversations, setConversations] = useState<IConversationProps[]>([]);
  const [lastAssistantMessage, setLastAssistantMessage] =
    useState<IConversationProps>();
  const [clone, setClone] = useState<Object3D>();

  useEffect(() => {
    if (scene) {
      // cloneを作成
      const clone = SkeletonUtils.clone(scene);
      // animationsもコピー
      clone.animations = animations;
      setClone(clone);
    }
    if (target.current) {
      target.current.position.copy(position as Vector3);
      target.current.rotation.copy(rotation as Euler);
      target.current.scale.copy(scale as Vector3);
    }
  }, [scene]);

  const getAssistantMessage = async (
    cons: IConversationProps[]
  ): Promise<IConversationProps> => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversations: cons }),
    };
    const response = await fetch(apiEndpoint + apiRoute, requestOptions);
    const json = await response.json();
    // 失敗した場合、適当に埋め合わせする
    if (response.status !== 200) {
      return {
        role: "assistant",
        content: "すみません、\nよくわかりませんでした。",
      };
    }
    // NPCメッセージに追記する
    npcChatHistory.current.push(
      {
        id: om.id,
        username: npcName,
        message: json.data.content as string,
        messagedAt: new Date(),
      }
    );
    // webRTCを使用していれば、publishする
    if (config.multi){
      if (publishData) {
        publishData({
          id: om.id,
          username: npcName,
          message: json.data.content as string,
        });
      }
    }
    return {
      role: "assistant",
      content: json.data.content,
    };
  };

  useEffect(() => {
    if (localMessage !== "") {
      if (!config.isApi) return;
      if (!player.current) return;
      const convs = [...conversations];
      // systemが設定されている場合、初期メッセージを追加する
      if (system && conversations.length === 0) {
        const systemMessage: IConversationProps = {
          role: "system",
          content: system,
        };
        convs.push(systemMessage);
      }

      if (localMessage !== "") {
        const userMessage: IConversationProps = {
          role: "user",
          content: localMessage,
        };
        convs.push(userMessage);
        // 最後の要素が重複していないかチェックする
        if (conversations.length > 0) {
          const lastConversation = conversations[conversations.length - 1];
          if (lastConversation.content === userMessage.content) {
            return;
          }
        }
        setConversations(convs);
      }
    }
  }, [localMessage]);

  useEffect(() => {
    const update = async (conversations: IConversationProps[]) => {
      const assistantMessage: IConversationProps = await getAssistantMessage(
        conversations
      );
      const _nowConversations = conversations;
      _nowConversations.push(assistantMessage);
      setConversations([..._nowConversations]);
      setLastAssistantMessage(assistantMessage);
    };
    // conversationsの最後のroleがuserの場合のみ、assistantの発言を追加する
    if (conversations.length > 0) {
      const lastConversation = conversations[conversations.length - 1];
      if (lastConversation.role === "user") {
        update(conversations);
      }
    }
  }, [conversations]);

  useEffect(() => {
    if (
      isSpeak &&
      lastAssistantMessage &&
      lastAssistantMessage.content &&
      lastAssistantMessage.content !== ""
    ) {
      playTextToSpeech({
        text: lastAssistantMessage.content,
        lang: "ja-JP",
        speed: talkSpeed,
      });
    }
  }, [lastAssistantMessage]);

  useFrame((state, delta) => {
    if (target.current) {
      if (isRandomMove) {
        // 調整中
      }
      if (!player.current) return;
      const curPosition = player.current.position.clone();
      const dinstance = curPosition.distanceTo(target.current.position);
      if (dinstance < conversationDistance) {
        // 現在メッセージがLocalと異なれば更新
        if (curMessage.current && curMessage.current !== "") {
          if (localMessage !== curMessage.current){
            setLocalMessage(curMessage.current);
          }
        }
        // trackingRotationがtrueの場合、curPositionの方向を向く
        const rotationY = Math.atan2(
          curPosition.x - target.current.position.x,
          curPosition.z - target.current.position.z
        );
        if (trackingRotation) {
          // 向くときはTargetPositionに向くように回転させる
          if (rangeAzimuthAngle) {
            const targetDeg = MathUtils.radToDeg(target.current.rotation.y);
            const nowDeg = MathUtils.radToDeg(rotationY);
            const minDeg = targetDeg - MathUtils.radToDeg(rangeAzimuthAngle);
            const maxDeg = targetDeg + MathUtils.radToDeg(rangeAzimuthAngle);
            if (minDeg < nowDeg && nowDeg < maxDeg) {
              if (trackingNodeName) {
                const trackingNode = nodes[trackingNodeName];
                if (trackingNode) {
                  trackingNode.rotation.y =
                    rotationY - target.current.rotation.y;
                } else {
                  target.current.rotation.y = rotationY;
                }
              } else {
                target.current.rotation.y = rotationY;
              }
            }
          } else {
            target.current.rotation.y = rotationY;
          }
        }
        // targetの上にメッセージを表示する
        if (mesHtmlRef.current) {
          const mesPosition = new Vector3();
          mesPosition.setFromMatrixPosition(target.current.matrixWorld);
          const offsetY = 2;
          mesHtmlRef.current.position.set(
            mesPosition.x,
            mesPosition.y + offsetY,
            mesPosition.z
          );
        }
      } else {
        if (mesHtmlRef.current) {
          mesHtmlRef.current.visible = false;
          setLastAssistantMessage(undefined);
        }
      }
    }
  });

  return (
    <>
      <DisntanceVisible distance={om.args.distance}>
        <group
          ref={target}
          position={position}
          scale={scale}
          rotation={rotation}
        >
          {clone && <AnimationHelper id={om.id} object={clone} />}
        </group>
      </DisntanceVisible>
      {lastAssistantMessage && (
        <mesh ref={mesHtmlRef}>
          <Html position={[0, 0.5, 0]}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translate(-50%, 0)",
                padding: "10px",
                width: "200px",
                borderRadius: "5px",
                background: textBackground,
                userSelect: "none",
                fontSize: "0.8em",
              }}
            >
              {lastAssistantMessage?.content}
            </div>
          </Html>
        </mesh>
      )}
    </>
  );
};
