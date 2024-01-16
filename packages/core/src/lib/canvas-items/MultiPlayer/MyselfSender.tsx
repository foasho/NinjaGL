import React from "react";
import {
  useNinjaEngine,
  useWebRTC,
  IPublishData,
  useMultiInputControl,
} from "../../hooks";
import { useFrame } from "@react-three/fiber";

/**
 * MultiPlayer用
 * 自分自身のデータを共有
 */
export const MyselfSender = () => {
  const { player, playerInfo, playerIsOnGround } = useNinjaEngine();
  const { publishData } = useWebRTC();
  const { input } = useMultiInputControl();

  useFrame(() => {
    if (publishData && player.current) {
      const sendData: IPublishData = {
        position: player.current.position,
        rotation: player.current.rotation,
        objectURL: player.current.userData.url,
        input: { ...input, pressedKeys: [] }, // セキュリティのため、押されたキーは送信しない
        id: player.current.userData.omId,
        username: playerInfo.current? playerInfo.current.name : "",
        thumbnailImgURL: playerInfo.current? playerInfo.current.avatar : undefined,
        playerIsOnGround: playerIsOnGround.current,
      };
      publishData(sendData);
    }
  });

  return <></>;
};
