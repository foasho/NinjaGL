import React from "react";
import { useNinjaEngine } from "../../hooks";
import { Others } from "./Others";
import { MyselfSender } from "./MyselfSender";
import { ShareColliders } from "./ShareCollider";

export const MultiPlayer = () => {
  return (
    <>
      <Others />
      <MyselfSender />
      <ShareColliders />
    </>
  );
};
