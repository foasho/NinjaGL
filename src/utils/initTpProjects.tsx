import { IObjectManagement, IScriptManagement, IUIManagement } from "@ninjagl/core";
import { Euler, MathUtils, Vector3 } from "three";

export const initTpOms = (): IObjectManagement[] => {
  return [
    {
      id: MathUtils.generateUUID(),
      name: "player",
      type: "avatar",
      args: {
        type: "avatar",
        url: "/models/ybot.glb",
        position: new Vector3(0, 0, 0),
        castShadow: true,
        receiveShadow: true,
        animationLoop: true,
        offsetY: 3.0,
      },
      physics: false,
      phyType: "capsule",
      visibleType: "force",
      visible: true,
    },
    {
      id: MathUtils.generateUUID(),
      name: "box01",
      type: "three",
      args: {
        type: "box",
        position: new Vector3(-5, 0.5, 5),
        scale: new Vector3(1, 1, 1),
        materialData: {
          type: "standard",
          value: "#4785FF",
        },
        castShadow: true,
        receiveShadow: true,
      },
      physics: true,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    {
      id: MathUtils.generateUUID(),
      name: "wall01",
      type: "three",
      args: {
        type: "box",
        position: new Vector3(0, 2, 16),
        scale: new Vector3(32, 4, 0.2),
        materialData: {
          type: "standard",
          value: "#111212",
        },
        castShadow: true,
        receiveShadow: true,
      },
      physics: true,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    {
      id: MathUtils.generateUUID(),
      name: "Directional1",
      type: "light",
      args: {
        type: "directional",
        position: new Vector3(14, 7, 8),
        materialData: {
          type: "standard",
          value: "#e3dfcc",
        },
        intensity: 1,
        castShadow: true,
      },
      physics: false,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    {
      id: MathUtils.generateUUID(),
      name: "Spot1",
      type: "light",
      args: {
        type: "spot",
        position: new Vector3(-6, 10, -22),
        materialData: {
          type: "standard",
          value: "#FDF1D9",
        },
        intensity: 1,
        castShadow: true,
        receiveShadow: true,
      },
      physics: false,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    {
      id: MathUtils.generateUUID(),
      name: "floor",
      type: "three",
      args: {
        type: "plane",
        position: new Vector3(0, 0, 0),
        rotation: new Euler(-Math.PI / 2, 0, 0),
        scale: new Vector3(32, 32, 32),
        materialData: {
          type: "reflection",
          value: "#111212",
        },
        castShadow: true,
        receiveShadow: true,
      },
      physics: true,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    {
      id: MathUtils.generateUUID(),
      name: "Environment",
      type: "environment",
      args: {
        preset: "sunset",
        blur: 0.7,
        background: true,
      },
      physics: false,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    {
      id: MathUtils.generateUUID(),
      name: "*LF (rect)",
      type: "lightformer",
      args: {
        form: "rect",
        color: "#ffeb38",
        intensity: 1,
        position: new Vector3(-5, 5, -5),
        scale: new Vector3(3, 3, 3),
        lookAt: new Vector3(0, 0, 0),
        isFloat: true,
      },
      physics: false,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    {
      id: MathUtils.generateUUID(),
      name: "*LF (ring)",
      type: "lightformer",
      args: {
        form: "ring",
        color: "#e60b0b",
        intensity: 10,
        position: new Vector3(10, 5, 10),
        scale: new Vector3(3, 3, 3),
        lookAt: new Vector3(0, 0, 0),
        isFloat: true,
      },
      physics: false,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    // // Text3D
    {
      id: MathUtils.generateUUID(),
      name: "*texxt3d",
      type: "text3d",
      args: {
        content: "Welcome to \nNinjaGL!",
        rotation: new Euler(0, -Math.PI, 0),
        color: "#4785FF",
        intensity: 10,
        position: new Vector3(4, 7, 9),
      },
      physics: false,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    // 汎用オブジェクトたち
    {
      id: MathUtils.generateUUID(),
      name: "box01",
      type: "three",
      args: {
        type: "box",
        position: new Vector3(-5, 1, 5),
        scale: new Vector3(2, 2, 3),
        materialData: {
          type: "standard",
          value: "#e2e2e2",
        },
        castShadow: true,
        receiveShadow: true,
      },
      physics: true,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    {
      id: MathUtils.generateUUID(),
      name: "box01",
      type: "three",
      args: {
        type: "box",
        position: new Vector3(-5, 0.5, 2.5),
        scale: new Vector3(2, 1, 2),
        materialData: {
          type: "standard",
          value: "#e2e2e2",
        },
        castShadow: true,
        receiveShadow: true,
      },
      physics: true,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    {
      id: MathUtils.generateUUID(),
      name: "box01",
      type: "three",
      args: {
        type: "box",
        position: new Vector3(-1, 1, 6),
        scale: new Vector3(6, 2, 1),
        materialData: {
          type: "standard",
          value: "#e2e2e2",
        },
        castShadow: true,
        receiveShadow: true,
      },
      physics: true,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    {
      id: MathUtils.generateUUID(),
      name: "box01",
      type: "three",
      args: {
        type: "box",
        position: new Vector3(2, 1, 8.5),
        scale: new Vector3(1, 2, 6),
        materialData: {
          type: "standard",
          value: "#e2e2e2",
        },
        castShadow: true,
        receiveShadow: true,
      },
      physics: true,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    // // Audio バグ調査中
    // {
    //   id: MathUtils.generateUUID(),
    //   name: "audio",
    //   type: "audio",
    //   args: {
    //     url: "/audios/planetarium_garden.mp3",
    //     position: new Vector3(0, 0, 0),
    //     distance: 16,
    //     loop: true,
    //     autoplay: true,
    //     volume: 0.5,
    //   },
    //   physics: false,
    //   phyType: "box",
    //   visibleType: "auto",
    //   visible: true,
    // },
    // AnimationObject
    {
      id: MathUtils.generateUUID(),
      name: "object01",
      type: "object",
      args: {
        url: "/models/ybot.glb",
        position: new Vector3(3, 0, -1),
        rotation: new Euler(0, Math.PI / 4, 0),
        castShadow: true,
        receiveShadow: true,
        defaultAnimation: "Idle",
      },
      physics: false,
      phyType: "box",
      visibleType: "auto",
      visible: true,
    },
    // NPCの追加
    {
      id: MathUtils.generateUUID(),
      name: "npc",
      type: "ai-npc",
      args: {
        type: "ai-npc",
        url: "/models/ybot.glb",
        position: new Vector3(3, 0, 3),
        rotation: new Euler(0, Math.PI / 4, 0),
        trackingRotation: true,
        castShadow: true,
        receiveShadow: true,
        talkSpeed: 1.5,
        isSpeak: true,
        defaultAnimation: "Idle",
      },
      physics: false,
      phyType: "capsule",
      visibleType: "force",
      visible: true,
    },
  ];
};

export const initTpSms = (): IScriptManagement[] => {
  return [];
};

export const initTpUis = (): IUIManagement[] => {
  return [
    {
      type: "controller",
      id: MathUtils.generateUUID(),
      name: "btn01",
      position: {
        x: 10,
        y: 10,
      },
      styles: ``,
      args: {},
      visible: true,
    },
  ];
};
