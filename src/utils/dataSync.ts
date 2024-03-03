"use client";
import { IConfigParams, IObjectManagement, IScriptManagement } from "@ninjagl/core";
import { debounce } from "lodash-es";

import { OMArgs2Obj } from "./convs";
import { uploadFile } from "./upload";

/**
 * OMのデータを送信する
 */
const _sendServerOM = async (projectId: number, om: IObjectManagement) => {
  if (!om) return;
  const _om = OMArgs2Obj(om, true);
  return fetch("/api/oms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, om: _om }),
  });
};
export const sendServerOM = debounce(_sendServerOM, 500);

export const deleteServerOM = async (projectId: number, id: string) => {
  return fetch(`/api/oms`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, omId: id }),
  });
};

/**
 * OMSのデータを一括で送信する
 */
export const sendServerOMs = async (projectId: number, oms: IObjectManagement[]) => {
  const _oms = oms.map((om) => OMArgs2Obj(om, true));
  return fetch("/api/oms/bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, oms: _oms }),
  });
};

/**
 * TODO: SMのデータを送信する
 */
export const sendServerSM = async (projectId: number, sm: IScriptManagement) => {
  if (!sm) return;
  return fetch("/api/sms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, sm }),
  });
};

export const deleteServerSM = async (projectId: number, id: string) => {
  return fetch(`/api/sms`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, smId: id }),
  });
};

/**
 * TODO: SMSのデータを一括で送信する
 */
export const sendServerSMs = async (projectId: number, sms: IScriptManagement[]) => {
  return fetch("/api/sms/bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, sms }),
  });
};

/**
 * プロジェクトの設定を送信する
 */
const _sendServerConfig = async (projectId: number, config: IConfigParams) => {
  return fetch("/api/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, config }),
  });
};
export const sendServerConfig = debounce(_sendServerConfig, 500);

/**
 * プロジェクトを更新する
 */
export const updateProjectData = async (
  projectId: number,
  config: IConfigParams | null,
  oms: IObjectManagement[],
  sms: IScriptManagement[],
  canvas: React.MutableRefObject<HTMLCanvasElement | null>,
) => {
  console.log("updateProjectData", canvas);
  try {
    // await sendServerConfig(projectId, config);
    // await sendServerOMs(projectId, oms);
    // await sendServerSMs(projectId, sms);
    // Promise.allでまとめて送信し、全ての送信が終わるまで待つ
    await Promise.all([
      config ? sendServerConfig(projectId, config) : null,
      sendServerOMs(projectId, oms),
      sendServerSMs(projectId, sms),
    ]);
    if (canvas.current) {
      const base64 = canvas.current.toDataURL("image/png");
      const blob = await (await fetch(base64)).blob();
      // blobをFileに変換
      const file = new File([blob], `${projectId}.png`, { type: "image/png" });
      // upload to blob
      const res = await uploadFile(file, `projects-preview/${projectId}.png`);
      if (!res) {
        throw new Error("Error uploading file");
      }
      if (!res.url) {
        throw new Error("Error uploading file");
      }
      await fetch(`/api/projects`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId, preview: res.url }),
      });
    }
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};
