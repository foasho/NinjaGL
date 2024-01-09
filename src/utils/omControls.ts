import { IObjectManagement, OMType } from "@ninjagl/core";
import { t } from "i18next";
import { Euler, MathUtils, Vector3 } from "three";

import { MySwal } from "@/commons/Swal";

export const addInitOM = (oms: IObjectManagement[], type: OMType, value: string | null): IObjectManagement | null => {
  switch (type) {
    case "light":
      return {
        id: MathUtils.generateUUID(),
        name: `*${value}`,
        type: "light",
        args: {
          type: value,
          castShadow: true,
          receiveShadow: false,
        },
        physics: false,
        phyType: "box",
        visibleType: "auto",
        visible: true,
      };
    case "sky":
      const sky = oms.find((om) => om.type === "sky");
      if (sky) {
        MySwal.fire({
          text: t("skyExistAlert"),
          icon: "warning",
          showCancelButton: false,
          confirmButtonText: "OK",
        });
        return null;
      }
      return {
        id: MathUtils.generateUUID(),
        name: `*${value}`,
        type: "sky",
        args: {
          type: value,
        },
        physics: false,
        phyType: "box",
        visibleType: "auto",
        visible: true,
      };
    case "three":
      return {
        id: MathUtils.generateUUID(),
        name: `*${value}`,
        type: "three",
        args: {
          type: value,
        },
        physics: false,
        phyType: "box",
        visibleType: "auto",
        visible: true,
      };
    case "fog":
      const fog = oms.find((om) => om.type === "fog");
      if (fog) {
        MySwal.fire({
          text: t("fogExistAlert"),
          icon: "warning",
          showCancelButton: false,
          confirmButtonText: "OK",
        });
        return null;
      }
      return {
        id: MathUtils.generateUUID(),
        name: `*${value}`,
        type: "fog",
        args: {
          type: value,
        },
        physics: false,
        phyType: "box",
        visibleType: "auto",
        visible: true,
      };
    case "environment":
      const environment = oms.find((om) => om.type === "environment");
      if (environment) {
        MySwal.fire({
          text: t("environmentExistAlert"),
          icon: "warning",
          showCancelButton: false,
          confirmButtonText: "OK",
        });
        return null;
      }
      return {
        id: MathUtils.generateUUID(),
        name: `*${value}`,
        type: "environment",
        args: {
          type: value,
        },
        physics: false,
        phyType: "box",
        visibleType: "auto",
        visible: true,
      };
    case "lightformer":
      return {
        id: MathUtils.generateUUID(),
        name: `*LF-(${value})`,
        type: "lightformer",
        args: {
          form: value,
          color: "#ffffff",
          intensity: 1,
          position: new Vector3(0, 1, 0),
        },
        physics: false,
        phyType: "box",
        visibleType: "auto",
        visible: true,
      };
    case "effect":
      if (value === "bloom") {
        return {
          id: MathUtils.generateUUID(),
          name: `*${value}`,
          type: "effect",
          args: {
            type: value,
            luminanceThreshold: 0.2,
            mipmapBlur: true,
            luminanceSmoothing: 0,
            intensity: 1.25,
          },
          physics: false,
          phyType: "box",
          visibleType: "auto",
          visible: true,
        };
      } else if (value === "ssao") {
        // TODO: SSAOの初期値を設定する
      } else if (value === "ssr") {
        // TODO: SSRの初期値を設定する
      }
      return null;
    case "water":
      return {
        id: MathUtils.generateUUID(),
        name: `*${value}`,
        type: "water",
        args: {
          type: value,
          width: 5,
          height: 5,
          widthSegments: 12,
          heightSegments: 12,
        },
        physics: false,
        phyType: "box",
        visibleType: "auto",
        visible: true,
      };
    case "landscape":
      return {
        id: MathUtils.generateUUID(),
        name: `*${value}`,
        type: "landscape",
        args: {
          type: value,
        },
        physics: true,
        phyType: "box",
        visibleType: "force",
        visible: true,
      };
    case "text":
      return {
        id: MathUtils.generateUUID(),
        name: `*${value}`,
        type: "text",
        args: {
          content: "テキスト",
          rotation: new Euler(0, -Math.PI, 0),
        },
        physics: false,
        phyType: "box",
        visibleType: "auto",
        visible: true,
      };
    case "text3d":
      return {
        id: MathUtils.generateUUID(),
        name: `*${value}`,
        type: "text3d",
        args: {
          content: "テキスト",
          rotation: new Euler(0, -Math.PI, 0),
        },
        physics: false,
        phyType: "box",
        visibleType: "auto",
        visible: true,
      };
    case "ai-npc":
      return {
        id: MathUtils.generateUUID(),
        name: "npc",
        type: "ai-npc",
        args: {
          type: "ai-npc",
          url: "/models/ybot.glb",
          trackingRotation: true,
          castShadow: true,
          receiveShadow: true,
          talkSpeed: 1.0,
          isSpeak: true,
          defaultAnimation: "Idle",
        },
        physics: false,
        phyType: "capsule",
        visibleType: "force",
        visible: true,
      };
    case "audio":
      return {
        id: MathUtils.generateUUID(),
        name: "audio",
        type: "audio",
        args: {
          url: "/audios/planetarium_garden.mp3",
          position: new Vector3(0, 0, 0),
          distance: 16,
          loop: true,
          autoplay: true,
          volume: 0.5,
        },
        physics: false,
        phyType: "box",
        visibleType: "auto",
        visible: true,
      };
  }
  return null;
};
