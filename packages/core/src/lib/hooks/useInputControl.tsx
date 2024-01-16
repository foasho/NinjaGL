import React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Vector2 } from "three";
import { IInputMovement } from "../utils";

/**
 * ----------------
 * InputController
 * ----------------
 */

/**
 * 接続されたデバイスの種類を返す
 */
export const detectDeviceType = (): "mobile" | "tablet" | "desktop" => {
  if (typeof window !== "undefined") {
    // check if window is defined (we are on client side)
    const ua = navigator.userAgent;
    if (
      ua.indexOf("iPhone") > 0 ||
      ua.indexOf("iPod") > 0 ||
      (ua.indexOf("Android") > 0 && ua.indexOf("Mobile") > 0)
    ) {
      return "mobile";
    } else if (ua.indexOf("iPad") > 0 || ua.indexOf("Android") > 0) {
      return "tablet";
    } else if (
      navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 2 &&
      /MacIntel/.test(navigator.platform)
    ) {
      return "tablet";
    } else {
      return "desktop";
    }
  } else {
    return "desktop"; // as a default, return "desktop" when window is not defined (we are on server side)
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
export const setManualInputs = (names: string[], vals: boolean[]) => {
  names.map((name, idx) => {
    // @ts-ignore
    manualKeyState[name] = vals[idx];
  });
};
export const setManualInput = (key: string, val: boolean) => {
  // @ts-ignore
  if (manualKeyState[key] !== undefined) {
    // @ts-ignore
    manualKeyState[key] = val;
  }
};

/**
 * タッチ操作方式 * @returns
 */
export const getManualState = (): IInputMovement => {
  return { ...manualKeyState };
};

interface IInputControl {
  device?: "auto" | "mobile" | "tablet" | "desktop";
  targetId?: string;
  enabled?: boolean;
  gamePadLatency?: number;
}
export const useInputControl = ({
  device = "auto",
  targetId = "Ninjaviewer",
  enabled = true,
  gamePadLatency = 120,
}: IInputControl) => {
  const [_enabledFlag, setEnabledFlag] = useState<boolean>(enabled);
  const [setupCount, setSetupCount] = useState<number>(1);
  // タッチ発火フラグ(入力が競合しないように)
  // Touch操作中はCallbackでisTouchフラグを持ちたい
  const [touchFlag, setTouchFlag] = useState<boolean>(false);
  const keyboardFlag = useRef<boolean>(false);
  const gamepadFlag = useRef<boolean>(false);
  const [runId, setRunId] = useState<string | undefined>(undefined);
  const [jumpId, setJumpId] = useState<string | undefined>(undefined);
  // -------------------------------------------------
  // ジョイスティックのRef
  const joystick = useRef<HTMLDivElement>(null);
  const joystickOuter = useRef<HTMLDivElement>(null);
  const joystickInner = useRef<HTMLDivElement>(null);
  const startPosition = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const joyRadius = useRef<number>(0);

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
    const key = moveKeyFromCode(e.code);
    // @ts-ignore
    movement.current[key] = key === "action" ? true : 1;
    movement.current.speed = 1;
    //  movement.currentが移動系の入力がされた場合にフラグを発火
    // @ts-ignore
    if (movement.current[key]) {
      keyboardFlag.current = true;
      gamepadFlag.current = false;
    }
    if (!movement.current.pressedKeys.includes(e.code)) {
      movement.current.pressedKeys.push(e.code);
    }
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    const key = moveKeyFromCode(e.code);
    // @ts-ignore
    movement.current[key] = key === "action" ? false : 0;
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

  /**
   * スマホ対応
   */
  let movementTouchId: null | number = null;
  const handleTouchStart = (e: TouchEvent) => {
    // 上位のイベントをキャンセル
    e.stopPropagation();
    // e.preventDefault(); // イベントの発火をキャンセル
    if (movementTouchId === null) {
      // Touchは最後に発火したタッチのみを取得する
      const targetTouch = e.touches[e.touches.length - 1];
      movementTouchId = targetTouch.identifier;
      movement.current.prevDrag = new Vector2(
        targetTouch.clientX,
        targetTouch.clientY
      );
      // startPositionにタッチした位置をセット
      startPosition.current = {
        x: targetTouch.clientX,
        y: targetTouch.clientY,
      };
      // 描画の更新
      if (joystickOuter.current) {
        joystickOuter.current.style.left = `${targetTouch.pageX}px`;
        joystickOuter.current.style.top = `${targetTouch.pageY}px`;
        joystickOuter.current.style.display = "block";
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault(); // イベントの発火をキャンセル
    e.stopPropagation();
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === movementTouchId) {
        const targetTouch = e.touches[i];
        if (movement.current.prevDrag === null) {
          movement.current.prevDrag = new Vector2(
            targetTouch.clientX,
            targetTouch.clientY
          );
        }
        movement.current.curDrag = new Vector2(
          targetTouch.clientX,
          targetTouch.clientY
        );
        const deltaX = movement.current.curDrag.x - startPosition.current.x;
        const deltaY = movement.current.curDrag.y - startPosition.current.y;

        const initialPosition = new Vector2(
          startPosition.current.x,
          startPosition.current.y
        );

        // InnerがOuter範囲内にあるかどうかをチェック
        const distanceFromCenter = Math.sqrt(
          Math.pow(deltaX, 2) + Math.pow(deltaY, 2)
        );

        // 中心からの距離と角度を計算
        const angle = Math.atan2(deltaY, deltaX);
        const forwardAmount = Math.sin(angle) * movement.current.speed;
        const rightAmount = Math.cos(angle) * movement.current.speed;

        movement.current.forward = Math.max(0, -forwardAmount);
        movement.current.backward = Math.max(0, forwardAmount);
        movement.current.left = Math.max(0, -rightAmount);
        movement.current.right = Math.max(0, rightAmount);

        // スピードの更新
        movement.current.speed = distanceFromCenter / joyRadius.current;
        // speedのMAXは1.5
        movement.current.speed = Math.min(1.5, movement.current.speed);
        movement.current.prevDrag = movement.current.curDrag.clone();

        // 描画の更新
        if (joystickInner.current) {
          joystickInner.current.style.left = `${targetTouch.pageX}px`;
          joystickInner.current.style.top = `${targetTouch.pageY}px`;
          joystickInner.current.style.display = "block";
        }
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      // 変更: すべての終了したタッチイベントをループ処理
      if (e.changedTouches[i].identifier === movementTouchId) {
        // Reset movement states
        movement.current.prevDrag = null;
        movement.current.curDrag = null;
        movement.current.forward = 0;
        movement.current.backward = 0;
        movement.current.left = 0;
        movement.current.right = 0;
        movement.current.speed = 0; // タッチ終了時にスピードをリセット
        setTouchFlag(false);
        movementTouchId = null;
      }
    }
    if (joystickOuter.current) {
      joystickOuter.current.style.display = "none";
    }
    if (joystickInner.current) {
      joystickInner.current.style.display = "none";
    }
  };

  // attachRunBtn
  const attachRunBtn = (runBtnId: string) => {
    setRunId(runBtnId);
  };

  // attachJumpBtn
  const attachJumpBtn = (jumpBtnId: string) => {
    setJumpId(jumpBtnId);
  };

  /**
   * ゲームパッド対応
   */
  const handleGamepadInput = () => {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad) {
        // キーボード入力をさせない
        keyboardFlag.current = false;
        // ゲームパッドのボタンと軸に対応した操作をここで定義
        const forward =
          gamepad.buttons[12]?.pressed || gamepad.axes[1] < -0.1
            ? Math.abs(gamepad.axes[1])
            : 0;
        const backward =
          gamepad.buttons[13]?.pressed || gamepad.axes[1] > 0.1
            ? Math.abs(gamepad.axes[1])
            : 0;
        const left =
          gamepad.buttons[14]?.pressed || gamepad.axes[0] < -0.1
            ? Math.abs(gamepad.axes[0])
            : 0;
        const right =
          gamepad.buttons[15]?.pressed || gamepad.axes[0] > 0.1
            ? Math.abs(gamepad.axes[0])
            : 0;
        const jump = gamepad.buttons[0]?.pressed;
        // const dash = gamepad.buttons[2]?.pressed;
        const dash = gamepad.buttons[5]?.pressed; //RBに変更
        const action = gamepad.buttons[1]?.pressed;
        let angleX = gamepad.axes[2].toFixed(2);
        let angleY = gamepad.axes[3].toFixed(2);
        if (Math.abs(Number(angleX)) > 0.1 || Math.abs(Number(angleY)) > 0.1) {
          keyboardFlag.current = false;
          gamepadFlag.current = true;
        } else {
          angleX = "0";
          angleY = "0";
        }
        // どれかが入力されていればキーボード入力をさせない
        if (forward || backward || left || right || jump || dash || action) {
          keyboardFlag.current = false;
          gamepadFlag.current = true;
        }
        if (gamepadFlag.current) {
          movement.current.forward = forward;
          movement.current.backward = backward;
          movement.current.left = left;
          movement.current.right = right;
          movement.current.jump = jump;
          movement.current.dash = dash;
          movement.current.action = action;
          movement.current.speed = Math.max(forward, backward, left, right);
          movement.current.angleAxis = [Number(angleX), Number(angleY)];
        }
      }
    }
  };

  let movement = useRef<IInputMovement>({
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
    setEnabledFlag(enabled);
    setSetupCount(setupCount + 1);

    const deviceType = device === "auto" ? detectDeviceType() : device;

    // デスクトップ対応
    if (deviceType == "desktop") {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
      document.addEventListener("mousedown", handleClickDown);
      document.addEventListener("mouseup", handleClickUp);
    }

    // スマホ / タブレット対応
    if (deviceType == "mobile" || deviceType == "tablet") {
      if (runId) {
        const runBtn = document.getElementById(runId);
        if (runBtn) {
          // タッチされたときにmovement.current.dashをtrueにする
          runBtn.addEventListener("touchstart", () => {
            movement.current.dash = true;
          });
          // タッチが離されたときにmovement.current.dashをfalseにする
          runBtn.addEventListener("touchend", () => {
            movement.current.dash = false;
          });
        }
      }
      if (jumpId) {
        const jumpBtn = document.getElementById(jumpId);
        if (jumpBtn) {
          // タッチされたときにmovement.current.jumpをtrueにする
          jumpBtn.addEventListener("touchstart", () => {
            movement.current.jump = true;
          });
          // タッチが離されたときにmovement.current.jumpをfalseにする
          jumpBtn.addEventListener("touchend", () => {
            movement.current.jump = false;
          });
        }
      }
    }

    // ゲームパッド対応
    const gamepadInterval = setInterval(() => {
      handleGamepadInput();
    }, gamePadLatency);

    return () => {
      if (deviceType == "desktop") {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
        document.removeEventListener("mousedown", handleClickDown);
        document.removeEventListener("mouseup", handleClickUp);
      }
      if (runId) {
        const runBtn = document.getElementById(runId);
        if (runBtn) {
          runBtn.removeEventListener("touchstart", () => {
            movement.current.dash = true;
          });
          runBtn.removeEventListener("touchend", () => {
            movement.current.dash = false;
          });
        }
      }
      // ゲームパッド対応
      clearInterval(gamepadInterval);
    };
  }, [runId, jumpId, enabled]);

  return {
    runId: runId,
    input: movement.current,
    attachRunBtn: attachRunBtn,
    attachJumpBtn: attachJumpBtn,
    handleTouchStart: handleTouchStart,
    handleTouchMove: handleTouchMove,
    handleTouchEnd: handleTouchEnd,
    joystick: joystick,
    joystickOuter: joystickOuter,
    joystickInner: joystickInner,
    joyRadius: joyRadius,
    touchFlag: touchFlag,
  };
};

type InputControlProps = {
  input: IInputMovement;
  attachJumpBtn: (id: string) => void;
  attachRunBtn: (id: string) => void;
  handleTouchStart: (e: TouchEvent) => void;
  handleTouchMove: (e: TouchEvent) => void;
  handleTouchEnd: (e: TouchEvent) => void;
  joystick: React.RefObject<HTMLDivElement>;
  joystickOuter: React.RefObject<HTMLDivElement>;
  joystickInner: React.RefObject<HTMLDivElement>;
  joyRadius: React.MutableRefObject<number>;
};
const InputControlContext = createContext<InputControlProps>(
  {} as InputControlProps
);

export const InputControlProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    input,
    attachJumpBtn,
    attachRunBtn,
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    joystick,
    joystickOuter,
    joystickInner,
    joyRadius,
  } = useInputControl({});

  return (
    <InputControlContext.Provider
      value={{
        input,
        attachJumpBtn,
        attachRunBtn,
        handleTouchEnd,
        handleTouchMove,
        handleTouchStart,
        joystick,
        joystickOuter,
        joystickInner,
        joyRadius,
      }}
    >
      {children}
    </InputControlContext.Provider>
  );
};

export const useMultiInputControl = () => useContext(InputControlContext);
