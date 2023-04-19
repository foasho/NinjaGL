import { Vector2 } from "three";
import React, { useEffect, useRef } from "react";
import { IInputMovement } from "./NinjaProps";

/**
 * ActionキーのリストEnum
 */
interface IActionKey {
  KeyW: "forward";
  KeyS: "backward";
  KeyA: "left";
  KeyD: "right";
  Space: "jump";
  ShiftLeft: "dash";
  ShiftRight: "dash";
  Shift: "dash";
  [key: string]: any;
}
export const EActionKey: IActionKey = {
  KeyW: "forward",
  KeyS: "backward",
  KeyA: "left",
  KeyD: "right",
  Space: "jump",
  ShiftLeft: "dash",
  ShiftRight: "dash",
  Shift: "dash"
}

const initialKeyState: IInputMovement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  dash: false,
  action: false,
  prevDrag: null,
  currDrag: null,
  deviceType: "desktop",
  pressedKeys: [],
};

export let manualKeyState: IInputMovement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  dash: false,
  action: false,
  prevDrag: null,
  currDrag: null,
  deviceType: "desktop",
  pressedKeys: [],
};

/**
 * 初期化
 */
export const initInput = (deviceType: "desktop" | "mobile" | "tablet") => {
  manualKeyState = { ...initialKeyState, deviceType: deviceType };
}

/**
 * 入力をセットする
 * @param names 
 * @param vals 
 */
export const setManualInputs = (names: string[], vals: boolean[]) => {
  names.map((name, idx) => {
    manualKeyState[name] = vals[idx];
  });
}
export const setManualInput = (key: string, val: boolean) => {
  if (manualKeyState[key] !== undefined) {
    manualKeyState[key] = val;
  }
}

/**
 * タッチ操作方式 * @returns 
 */
export const getManualState = (): IInputMovement => {
  return { ...manualKeyState }
}

/**
 * 入力イベント / 入力の型
 */
interface HTMLElementEvent<T extends HTMLElement> extends Event {
  target: T;
  code: string;
}
export const useInputControl = (deviceType: "mobile" | "tablet" | "desktop") => {

  const moveKeyFromCode = (key: string) => {
    if (EActionKey[key] === undefined) {
      return "action";
    }
    return EActionKey[key];
  };

  let movement = useRef<IInputMovement>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    dash: false,
    action: false,
    prevDrag: null,
    currDrag: null,
    deviceType: "desktop",
    pressedKeys: [],
  });

  useEffect(() => {
    /**
     * キーボード対応
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      movement.current[moveKeyFromCode(e.code)] = true;
      if (!movement.current.pressedKeys.includes(e.code)) {
        movement.current.pressedKeys.push(e.code);
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      movement.current[moveKeyFromCode(e.code)] = false;
      const index = movement.current.pressedKeys.indexOf(e.code);
      if (index > -1) {
        movement.current.pressedKeys.splice(index, 1);
      }
    };
    const handleClickDown = () => {
      movement.current.action = true;
    }
    const handleClickUp = () => {
      movement.current.action = false;
    }
    if (deviceType == "desktop") {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
      document.addEventListener("mousedown", handleClickDown);
      document.addEventListener("mouseup", handleClickUp);
    }

    let timer;
    if (deviceType == "mobile" || deviceType == "tablet") {
      const fps = 60;
      // timer = setInterval(() => {manualMovement()}, Number(1000/fps));
    }

    /**
     * スマホ対応 (あとで実装)
     */
    // handleTouch

    /**
     * ゲームパッド対応 (あとで実装)
     */
    // handleGamePad

    return () => {
      if (deviceType == "desktop") {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
        document.removeEventListener("mousedown", handleClickDown);
        document.removeEventListener("mouseup", handleClickUp);
      }
      if (deviceType == "mobile" || deviceType == "tablet") {
        // clearInterval(timer);
      }
    }
  }, []);

  return movement.current;
}