import { useEffect, useRef } from "react";

import { IInputMovement } from "@ninjagl/core";

/**
 * ----------------
 * InputController
 * ----------------
 */
export enum EDeviceType {
  Unknown = 0,
  Desktop = 1,
  Tablet = 2,
  Mobile = 3,
}
export const detectDeviceType = (): EDeviceType => {
  if (typeof window !== "undefined") {
    // check if window is defined (we are on client side)
    const ua = navigator.userAgent;
    if (ua.indexOf("iPhone") > 0 || ua.indexOf("iPod") > 0 || (ua.indexOf("Android") > 0 && ua.indexOf("Mobile") > 0)) {
      return EDeviceType.Mobile;
    } else if (ua.indexOf("iPad") > 0 || ua.indexOf("Android") > 0) {
      return EDeviceType.Tablet;
    } else if (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform)) {
      return EDeviceType.Tablet;
    } else {
      return EDeviceType.Desktop;
    }
  } else {
    return EDeviceType.Unknown; // as a default, return "desktop" when window is not defined (we are on server side)
  }
};

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
  [key: string]: string;
}
export const EActionKey: IActionKey = {
  KeyW: "forward",
  KeyS: "backward",
  KeyA: "left",
  KeyD: "right",
  Space: "jump",
  ShiftLeft: "dash",
  ShiftRight: "dash",
  Shift: "dash",
};

const initialKeyState: IInputMovement = {
  forward: 0,
  backward: 0,
  left: 0,
  right: 0,
  jump: false,
  dash: false,
  action: false,
  prevDrag: null,
  curDrag: null,
  speed: 0,
  pressedKeys: [],
  angleAxis: [0, 0],
};

export let manualKeyState: IInputMovement = {
  forward: 0,
  backward: 0,
  left: 0,
  right: 0,
  jump: false,
  dash: false,
  action: false,
  prevDrag: null,
  curDrag: null,
  speed: 0,
  pressedKeys: [],
  angleAxis: [0, 0],
};

/**
 * 初期化
 */
export const initInput = () => {
  manualKeyState = { ...initialKeyState };
};

/**
 * 入力をセットする
 * @param names
 * @param vals
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setManualInputs = (names: string[], vals: any[]) => {
  names.map((name, idx) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (manualKeyState as any)[name] = vals[idx];
  });
};
export const setManualInput = (key: string, val: boolean) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  if ((manualKeyState as any)[key] !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (manualKeyState as any)[key] = val;
  }
};

/**
 * タッチ操作方式 * @returns
 */
export const getManualState = (): IInputMovement => {
  return { ...manualKeyState };
};

interface IInputControl {
  device?: EDeviceType;
  targetId?: string;
}
export const useInputControl = ({
  device = EDeviceType.Unknown,
}: IInputControl) => {
  const keyboardFlag = useRef<boolean>(false);
  const gamepadFlag = useRef<boolean>(false);

  const moveKeyFromCode = (key: string) => {
    if (EActionKey[key] === undefined) {
      return "action";
    }
    return EActionKey[key];
  };

  /**
   * キーボード対応
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    const key = moveKeyFromCode(e.code) as keyof IInputMovement; // Add 'as keyof IInputMovement' to ensure type safety
    if (key){
      if (key === "action") {
        movement.current[key] = key === "action" ? true : false;
      }
      movement.current.speed = 1;
      if (movement.current[key]) {
        keyboardFlag.current = true;
        gamepadFlag.current = false;
      }
      if (!movement.current.pressedKeys.includes(e.code)) {
        movement.current.pressedKeys.push(e.code);
      }
    }
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    const key = moveKeyFromCode(e.code) as keyof IInputMovement;
    if (key){
      if (key === "action") {
        movement.current[key] = false;
      }
    }
    const index = movement.current.pressedKeys.indexOf(e.code);
    if (index > -1) {
      movement.current.pressedKeys.splice(index, 1);
    }
  };
  const handleClickDown = () => {
    movement.current.action = true;
  };
  const handleClickUp = () => {
    movement.current.action = false;
  };

  const movement = useRef<IInputMovement>({
    forward: 0,
    backward: 0,
    left: 0,
    right: 0,
    jump: false,
    dash: false,
    action: false,
    prevDrag: null,
    curDrag: null,
    speed: 0,
    pressedKeys: [],
    angleAxis: [0, 0],
  });

  useEffect(() => {

    const deviceType = device === EDeviceType.Unknown ? detectDeviceType() : device;

    // デスクトップ対応
    if (deviceType == EDeviceType.Desktop) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
      document.addEventListener("mousedown", handleClickDown);
      document.addEventListener("mouseup", handleClickUp);
    }

    return () => {
      if (deviceType == EDeviceType.Desktop) {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
        document.removeEventListener("mousedown", handleClickDown);
        document.removeEventListener("mouseup", handleClickUp);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    input: movement.current,
  };
};
